(function () {
  const session = UI.requireSession(["subjectId"]);
  if (!session) return;
  UI.setupAccountHeader();

  UI.qs("#subject-name-inline").textContent = UI.subjectName(session.subjectId);

  // Restore the selected block when the student returns to this screen.
  if (session.block) UI.qs("#block").value = session.block;

  UI.qs("#login-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const block = UI.qs("#block").value.trim();
    const validBlock = block === "COM231" || block === "COM232";
    const blockField = UI.qs("#block-field");
    blockField.classList.toggle("has-error", !validBlock);
    if (!validBlock) return;

    const submitBtn = UI.qs("#login-form button[type=submit]");
    submitBtn.disabled = true;
    submitBtn.textContent = "Please wait…";

    const response = await API.login({ name: session.name, block, subjectId: session.subjectId });
    Store.set({ block, studentId: response.studentId });
    window.location.href = "examtype.html";
  });
})();
