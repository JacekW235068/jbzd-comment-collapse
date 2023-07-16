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
      } else if (record.type == 'attributes') {
         if (record.target.className == "comment-dropdown active") {
            popup(record.target)
         } else if (record.target.className == "comment-dropdown") {
            popdown(record.target)
         }
      }
   }
}

popup = (element) => {
   element = findParent(element, (e) => {return e.className == "comment-wrapper comment-sub"})
   if (element)
      element.style.overflow = 'visible';
}

popdown = (element) => {
   element = findParent(element, (e) => {return e.className == "comment-wrapper comment-sub"})
   if (element)
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
   thread = findParent(event.currentTarget, (e) => {return e.parentElement.className == "comments"})
   button = thread.querySelector(".collapse-button")
   button.style.transform = button.style.transform == '' ? 'rotate(-90deg)' : ''
   comments = thread.querySelectorAll('.comment-sub')
   for (const subComment of comments) {
      subComment.style.maxHeight = subComment.style.maxHeight == '0px' ? subComment.scrollHeight + 'px' : '0px'
   }
}

findParent = (startElement, stopCondition) => {
   while (startElement && !stopCondition(startElement))
      startElement = startElement.parentElement
   return startElement
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
