function cellText(cell) {
  return cell ? cell.textContent.trim() : '';
}

function generateCaptchaCode() {
  return String(Math.floor(10000 + Math.random() * 90000));
}

function buildCaptchaDisplay(code) {
  const display = document.createElement('div');
  display.className = 'request-info-form-captcha-code';
  [...code].forEach((char) => {
    const span = document.createElement('span');
    span.textContent = char;
    span.style.transform = `rotate(${Math.round((Math.random() - 0.5) * 30)}deg)`;
    display.append(span);
  });
  return display;
}

function buildErrorEl() {
  const error = document.createElement('p');
  error.className = 'request-info-form-error';
  return error;
}

function applyCommonAttrs(input, field) {
  if (field.value) input.value = field.value;
  if (field.characterLimit) input.maxLength = field.characterLimit;
  if (field.nonEditable) input.disabled = true;
  if (field.placeholderText) input.placeholder = field.placeholderText;
  if (field.label) input.setAttribute('aria-label', field.label);
}

function buildInputField(field, type) {
  const wrapper = document.createElement('div');
  wrapper.className = 'request-info-form-field';

  const input = document.createElement('input');
  input.type = type;
  input.id = field.id;
  input.name = field.id;
  applyCommonAttrs(input, field);

  const error = buildErrorEl();
  wrapper.append(input, error);

  const validate = () => {
    let message = '';
    if (field.requiredMessage && !input.value.trim()) {
      message = field.requiredMessage;
    } else if (field.validationMessage && input.value.trim() && !input.checkValidity()) {
      message = field.validationMessage;
    }
    error.textContent = message;
    wrapper.classList.toggle('has-error', !!message);
    return !message;
  };

  return { wrapper, validate };
}

function buildTextareaField(field) {
  const wrapper = document.createElement('div');
  wrapper.className = 'request-info-form-field';

  const textarea = document.createElement('textarea');
  textarea.id = field.id;
  textarea.name = field.id;
  applyCommonAttrs(textarea, field);

  const error = buildErrorEl();
  wrapper.append(textarea, error);

  const validate = () => {
    const message = field.requiredMessage && !textarea.value.trim() ? field.requiredMessage : '';
    error.textContent = message;
    wrapper.classList.toggle('has-error', !!message);
    return !message;
  };

  return { wrapper, validate };
}

function buildSelectField(field) {
  const wrapper = document.createElement('div');
  wrapper.className = 'request-info-form-field';

  const select = document.createElement('select');
  select.id = field.id;
  select.name = field.id;
  if (field.nonEditable) select.disabled = true;
  if (field.label) select.setAttribute('aria-label', field.label);

  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = field.placeholderText || '';
  placeholder.disabled = true;
  placeholder.selected = !field.value;
  select.append(placeholder);

  (field.options || []).forEach((opt) => {
    const option = document.createElement('option');
    option.value = opt.value;
    option.textContent = opt.name;
    if (field.value === opt.value) option.selected = true;
    select.append(option);
  });

  const error = buildErrorEl();
  wrapper.append(select, error);

  const validate = () => {
    const message = field.requiredMessage && !select.value ? field.requiredMessage : '';
    error.textContent = message;
    wrapper.classList.toggle('has-error', !!message);
    return !message;
  };

  return { wrapper, validate };
}

function buildCheckboxField(field) {
  const wrapper = document.createElement('div');
  wrapper.className = 'request-info-form-checkbox';

  const inputLabel = document.createElement('label');
  inputLabel.className = 'request-info-form-checkbox-label';

  const input = document.createElement('input');
  input.type = 'checkbox';
  input.id = field.id;
  input.name = field.id;

  const text = document.createElement('div');
  text.className = 'request-info-form-checkbox-text';

  const title = document.createElement('span');
  title.className = 'request-info-form-checkbox-title';
  title.textContent = field.label;
  text.append(title);

  if (field.description) {
    const desc = document.createElement('p');
    desc.className = 'request-info-form-checkbox-description';
    desc.textContent = field.description;
    text.append(desc);
  }

  inputLabel.append(input, text);
  const error = buildErrorEl();
  wrapper.append(inputLabel, error);

  const validate = () => {
    const message = field.requiredMessage && !input.checked ? field.requiredMessage : '';
    error.textContent = message;
    wrapper.classList.toggle('has-error', !!message);
    return !message;
  };

  return { wrapper, validate };
}

function buildConsentField(field) {
  const wrapper = document.createElement('div');
  wrapper.className = 'request-info-form-consent';

  const label = document.createElement('label');
  label.className = 'request-info-form-consent-label';

  const input = document.createElement('input');
  input.type = 'checkbox';
  input.id = field.id;
  input.name = field.id;

  const text = document.createElement('span');
  text.append(`${field.label} `);
  if (field.linkUrl) {
    const link = document.createElement('a');
    link.href = field.linkUrl;
    link.textContent = field.linkText || field.linkUrl;
    text.append(link);
  }

  label.append(input, text);
  const error = buildErrorEl();
  wrapper.append(label, error);

  const validate = () => {
    const message = field.requiredMessage && !input.checked ? field.requiredMessage : '';
    error.textContent = message;
    wrapper.classList.toggle('has-error', !!message);
    return !message;
  };

  return { wrapper, validate };
}

function buildCaptchaField(field) {
  const wrapper = document.createElement('div');
  wrapper.className = 'request-info-form-captcha';

  const input = document.createElement('input');
  input.type = 'text';
  input.id = field.id;
  input.name = field.id;
  input.autocomplete = 'off';
  if (field.placeholderText) input.placeholder = field.placeholderText;
  if (field.label) input.setAttribute('aria-label', field.label);

  let code = generateCaptchaCode();
  const codeBox = document.createElement('div');
  codeBox.className = 'request-info-form-captcha-box';
  codeBox.append(buildCaptchaDisplay(code));

  const refreshBtn = document.createElement('button');
  refreshBtn.type = 'button';
  refreshBtn.className = 'request-info-form-captcha-refresh';
  refreshBtn.setAttribute('aria-label', 'Refresh code');
  refreshBtn.textContent = '↻';
  refreshBtn.addEventListener('click', () => {
    code = generateCaptchaCode();
    codeBox.replaceChildren(buildCaptchaDisplay(code));
    input.value = '';
    input.focus();
  });

  const captchaRow = document.createElement('div');
  captchaRow.className = 'request-info-form-captcha-row';
  captchaRow.append(input, codeBox, refreshBtn);

  const error = buildErrorEl();
  wrapper.append(captchaRow, error);

  const validate = () => {
    const value = input.value.trim();
    let message = '';
    if (field.requiredMessage && !value) {
      message = field.requiredMessage;
    } else if (value && value !== code) {
      message = field.validationMessage || 'The code you entered doesn\'t match';
    }
    error.textContent = message;
    wrapper.classList.toggle('has-error', !!message);
    return !message;
  };

  return { wrapper, validate };
}

function buildHeadingField(field) {
  const heading = document.createElement('h3');
  heading.className = 'request-info-form-section-heading';
  heading.textContent = field.label;
  return { wrapper: heading, validate: () => true };
}

function buildField(field) {
  switch (field.type) {
    case 'heading':
      return buildHeadingField(field);
    case 'textarea':
      return buildTextareaField(field);
    case 'select':
      return buildSelectField(field);
    case 'checkbox':
      return buildCheckboxField(field);
    case 'consent':
      return buildConsentField(field);
    case 'captcha':
      return buildCaptchaField(field);
    default:
      return buildInputField(field, field.type || 'text');
  }
}

async function loadFields() {
  const url = new URL('./mock-form.json', import.meta.url);
  try {
    const resp = await fetch(url);
    return resp.ok ? await resp.json() : [];
  } catch {
    return [];
  }
}

/**
 * loads and decorates the block
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const [headingRow] = block.children;
  const heading = cellText(headingRow) || 'Request Information';
  const fields = await loadFields();

  const headingEl = document.createElement('h2');
  headingEl.className = 'request-info-form-heading';
  headingEl.textContent = heading;

  const form = document.createElement('form');
  form.className = 'request-info-form-form';
  form.noValidate = true;

  const validators = [];
  let openRow = null;
  fields.forEach((field) => {
    const { wrapper, validate } = buildField(field);
    validators.push(validate);

    if (field.width === 'half') {
      if (!openRow || openRow.children.length >= 2) {
        openRow = document.createElement('div');
        openRow.className = 'request-info-form-row';
        form.append(openRow);
      }
      openRow.append(wrapper);
    } else {
      openRow = null;
      form.append(wrapper);
    }
  });

  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.className = 'request-info-form-submit';
  submitBtn.textContent = 'Submit';
  form.append(submitBtn);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const results = validators.map((validate) => validate());
    if (results.every(Boolean)) {
      const success = document.createElement('p');
      success.className = 'request-info-form-success';
      success.textContent = 'Thank you. Your request has been submitted.';
      form.replaceWith(success);
    } else {
      form.querySelector('.has-error input, .has-error select, .has-error textarea')?.focus();
    }
  });

  const inner = document.createElement('div');
  inner.className = 'request-info-form-inner';
  inner.append(headingEl, form);

  block.replaceChildren(inner);
}
