(function () {
  const session = UI.requireSession(["subjectId"]);
  if (!session) return;

  UI.qs("#subject-label").textContent = UI.subjectName(session.subjectId);
  UI.qs("#subject-name-inline").textContent = UI.subjectName(session.subjectId);

  // If the student already filled this in once (e.g. came back from the
  // exam-type screen), restore it instead of showing a blank form.
  if (session.name) UI.qs("#name").value = session.name;
  if (session.block) UI.qs("#block").value = session.block;

  UI.qs("#login-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const name = UI.qs("#name").value.trim();
    const block = UI.qs("#block").value.trim();
    const validName = /^[\p{L} ]+$/u.test(name);
    const validBlock = block === "COM232";
    const nameField = UI.qs("#name-field");
    const blockField = UI.qs("#block-field");
    nameField.classList.toggle("has-error", !validName);
    blockField.classList.toggle("has-error", !validBlock);
    if (!validName || !validBlock) return;

    const submitBtn = UI.qs("#login-form button[type=submit]");
    submitBtn.disabled = true;
    submitBtn.textContent = "Please wait…";

    const response = await API.login({ name, block, subjectId: session.subjectId });
    Store.set({ name, block, studentId: response.studentId });
    window.location.href = "examtype.html";
  });
})();
