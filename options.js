function saveOptions(e) {
    browser.storage.sync.set({
      fade: document.querySelector("#fade").checked,
      collapseText: document.querySelector("#collapse").checked,
      animationSpeed: document.querySelector("#speed").value
    });
    e.preventDefault();
  }
  
  function restoreOptions() {
    browser.storage.sync.get({
      fade: false,
      collapseText: true,
      animationSpeed: '8'
   }).then( (items) => {
      document.getElementById('fade').checked = items.fade;
      document.getElementById('collapse').checked = items.collapseText;
      e = document.getElementById("speed");
      e.value = items.animationSpeed
      document.getElementById('current-speed').innerText = `${(parseFloat(items.animationSpeed)/100.0).toFixed(3)}`;
      e.addEventListener('change' , (e) => {
        document.getElementById('current-speed').innerText = `${(parseFloat(e.currentTarget.value)/100.0).toFixed(3)}`;
      })
    })
  }

  if (typeof browser === "undefined") {
    browser = chrome;
  }
  document.addEventListener('DOMContentLoaded', restoreOptions);
  document.querySelector("form").addEventListener("submit", saveOptions);