(function () {
  if (Store.get().authenticated !== true) {
    window.location.replace("login.html");
    return;
  }
  UI.setupAccountHeader();

  const list = UI.qs("#subject-list");
  const arrow = '<span class="tile-go">Select subject<svg viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></span>';
  const subjectIcons = {
    ccincoml: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 5l-4 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    ccsfen1l: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.4 3.2 10 2h4l.6 1.2 1.4.8 1.3-.3 2 3.5-.8 1.1v1.6l.8 1.1-2 3.5-1.3-.3-1.4.8L14 17h-4l-.6-1.2-1.4-.8-1.3.3-2-3.5.8-1.1V9.1L4.7 8l2-3.5 1.3.3 1.4-.8Z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><circle cx="12" cy="10.5" r="2.4" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>',
    ctprfiss: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M12 7v12M7 7l-3 7h6L7 7ZM17 7l-3 7h6l-3-7ZM9 20h6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };

  CONFIG.SUBJECTS.forEach((subject) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "tile-card";
    button.innerHTML =
      '<span class="tile-emblem">' + (subjectIcons[subject.id] || subjectIcons.ccincoml) + '</span>' +
      '<span class="tile-title">' + subject.code + '</span>' +
      '<span class="tile-desc">' + subject.name + '</span>' +
      '<span class="tile-footer">' + arrow + '</span>';
    button.addEventListener("click", async () => {
      button.disabled = true;
      try {
        const session = Store.get();
        const response = await API.login({
          name: session.name,
          email: session.accountEmail,
          block: session.block,
          subjectId: subject.id
        });
        Store.set({
          subjectId: subject.id,
          studentId: response.studentId,
          completedExams: response.completedExams || [],
          completedScores: response.completedScores || {},
          completedResults: response.completedResults || {}
        });
        window.location.href = "examtype.html";
      } catch (error) {
        console.error("[Subject selection error]", error);
        button.disabled = false;
      }
    });
    list.appendChild(button);
  });
})();
