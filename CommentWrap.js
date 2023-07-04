makeCollapsableObserverWrapper = (mutationList) => {
   for (record of mutationList) {
      if (record.type != 'childList') {
         return
      }
      for (const child of record.addedNodes) {
         if (child.nodeName == "DIV") {
            makeCollapsable(child)
         }
      }
   }
}

rootCommentOnClick = (event) => {
   comments = event.currentTarget.parentElement.parentElement.parentElement.parentElement.querySelectorAll('.comment-sub')
   event.currentTarget.style.transform = event.currentTarget.style.transform == '' ? 'rotate(-90deg)' : ''
   for (const subComment of comments) {
      subComment.style.maxHeight = subComment.style.maxHeight == '0px' ? subComment.scrollHeight + 'px' : '0px'
   }
}

makeCollapsable = (commentThread) => {
   var comments = commentThread.querySelectorAll('.comment-sub');

   for (const subComment of comments) {
      subComment.style.maxHeight = subComment.scrollHeight + 'px';
   }

   var root = commentThread.querySelectorAll('.comment-wrapper')[0];
   if (root && comments.length > 0) {
      makeCollapsableRoot(root)
   }
}

makeCollapsableRoot = (elem) => {
   const oldProfileLink = elem.querySelector(".comment-avatar")

   const arrowUrl = chrome.runtime.getURL("res/arrow.png")
   const newProfileLink = `<div class="collapse-wrapper">${oldProfileLink.outerHTML}<img class="comment-avatar collapse-button" src="${arrowUrl}" /></div>`
   oldProfileLink.remove()
   art = elem.querySelector(".comment")
   art.insertAdjacentHTML("afterbegin", newProfileLink)
   button = elem.querySelector(".collapse-button")
   button.addEventListener('click', rootCommentOnClick)

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
