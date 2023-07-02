

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
   comments = event.currentTarget.parentElement.querySelectorAll('.comment-sub')
   for (const subComment of comments) {
         if (subComment.style.maxHeight == "0px") {
            subComment.style.maxHeight = subComment.scrollHeight + 'px';
         } else {
            subComment.style.maxHeight = '0px';
         }
   }
}

makeCollapsable = (commentThread) => {
   var comments = commentThread.querySelectorAll('.comment-sub');

   for (const subComment of comments) {
      subComment.style.maxHeight = subComment.scrollHeight + 'px';
   }

   var root = commentThread.querySelectorAll('.comment-wrapper')[0];
   if (root) {
      root.addEventListener('click', rootCommentOnClick, false)
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