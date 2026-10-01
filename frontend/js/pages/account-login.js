(function () {
  const session = Store.get();
  if (session.authenticated === true && session.name && session.accountEmail && session.block) {
    window.location.replace("home.html");
    return;
  }

  const form = document.querySelector("#login-form");
  const nameInput = document.querySelector("#name");
  const emailInput = document.querySelector("#email");
  const passwordInput = document.querySelector("#password");
  const passwordToggle = document.querySelector("#password-toggle");
  const blockInput = document.querySelector("#block");
  const nameField = document.querySelector("#name-field");
  const emailField = document.querySelector("#email-field");
  const passwordField = document.querySelector("#password-field");
  const blockField = document.querySelector("#block-field");
  const emailPattern = /^[^\s@]+@students\.national-u\.edu\.ph$/i;
  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

  passwordToggle.addEventListener("click", () => {
    const isHidden = passwordInput.type === "password";
    passwordInput.type = isHidden ? "text" : "password";
    passwordToggle.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");
    passwordToggle.title = isHidden ? "Hide password" : "Show password";
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const block = blockInput.value;
    const validName = /^[\p{L} ]+$/u.test(name);
    const validEmail = emailPattern.test(email);
    const validPassword = passwordPattern.test(password);
    const validBlock = block === "COM231" || block === "COM232";

    nameField.classList.toggle("has-error", !validName);
    emailField.classList.toggle("has-error", !validEmail);
    passwordField.classList.toggle("has-error", !validPassword);
    blockField.classList.toggle("has-error", !validBlock);
    if (!validName || !validEmail || !validPassword || !validBlock) return;

    Store.set({ authenticated: true, name, accountEmail: email.toLowerCase(), block });
    window.location.href = "home.html";
  });
})();
