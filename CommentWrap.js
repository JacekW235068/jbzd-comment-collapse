makeCollapsableObserverWrapper = (mutationList) => {
   for (record of mutationList) {
      if (record.type == 'childList') {
         for (const child of record.addedNodes) {
            if (child.nodeName == "DIV") {
               if (child.querySelector('div.comment-wrapper')) {
                  makeCollapsable(child) // New thread
               } else if (child.className == "article-action-tip") {
                  popup(record.target) // Comment author pop-up
               }
            }
         }
         for (const child of record.removedNodes) {
            if (child.nodeName == "DIV") {
               if (child.className == 'article-action-tip') {
                  // Removed children don't have parents
                  popdown(record.target) // Comment author pop-up
               }
            }
         }
      }
   }
}

popup = (element) => {
   while (element && element.className != "comment-wrapper comment-sub")
      element = element.parentElement
   if (!element) return
   element.style.overflow = 'visible';
}

popdown = (element) => {
   while (element && element.className != "comment-wrapper comment-sub")
      element = element.parentElement
   if (!element) return
   element.style.overflow = '';
}

makeCollapsable = (commentThread) => {
   var comments = commentThread.querySelectorAll('.comment-sub');

   for (const subComment of comments) {
      makeCollapsableSub(subComment)
   }

   var root = commentThread.querySelectorAll('.comment-wrapper')[0];
   if (root && comments.length > 0) {
      makeCollapsableRoot(root)
   }
}

makeCollapsableSub = (elem) => {
   elem.style.maxHeight = elem.scrollHeight + 'px';
   article = elem.querySelector(".comment")
   article.addEventListener('click',
      collapseThreadFromSub
   )
}

collapseThreadFromSub = (event) => {
   if (event.offsetX < 5 && event.currentTarget == event.target)
      collapseThread(event)
}

makeCollapsableRoot = (elem) => {
   const oldProfileLink = elem.querySelector(".comment-avatar")

   const arrowUrl = chrome.runtime.getURL("res/arrow.png")
   const newProfileLink = `<div class="collapse-wrapper">${oldProfileLink.outerHTML}<img class="comment-avatar collapse-button" src="${arrowUrl}" /></div>`
   oldProfileLink.remove()
   art = elem.querySelector(".comment")
   art.insertAdjacentHTML("afterbegin", newProfileLink)
   button = elem.querySelector(".collapse-button")
   button.addEventListener('click', collapseThread)
}

collapseThread = (event) => {
   thread = event.currentTarget
   while (thread && thread.parentElement.className != "comments")
      thread = thread.parentElement
   button = thread.querySelector(".collapse-button")
   button.style.transform = button.style.transform == '' ? 'rotate(-90deg)' : ''
   comments = thread.querySelectorAll('.comment-sub')
   for (const subComment of comments) {
      subComment.style.maxHeight = subComment.style.maxHeight == '0px' ? subComment.scrollHeight + 'px' : '0px'
   }
}


window.onload = (event) => {
   const config = { attributes: true, childList: true, subtree: true };
   const observer = new MutationObserver(makeCollapsableObserverWrapper);
   const targetNode = document.getElementsByClassName("comments")[0]
   observer.observe(targetNode, config);
   for (const thread of targetNode.childNodes) {
      if (thread.nodeName == "DIV") {
         makeCollapsable(thread)
      }
   }
};
