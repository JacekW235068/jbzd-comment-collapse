OPTIONS = {
}
if (typeof browser === "undefined") {
   browser = chrome;
}

// can't use scrollheight for elements displayed in flex
HEIGHTS = {}

makeCollapsableObserverWrapper = (mutationList) => {
   for (record of mutationList) {
      if (record.type == 'childList') {
         for (const child of record.addedNodes) {
            if (child.nodeName == "DIV") {
               if (child.firstChild.className == "comment-wrapper comment-sub") {
                  newSubComment(child) // New sub-comment
               } else if (child.firstChild.className == "comment-wrapper") {
                  makeCollapsable(child) // New thread
               } else if (child.className == "article-action-tip") {
                  popup(record.target) // Comment author pop-up
               }
            } else if (child.nodeName == "FORM") {
               if (child.className == 'comment-form') {
                  adjustHeightFor(record.target) // Comment response pop-up
               }
            } else if (child.nodeName == "#comment" && record.target.nodeName == "DIV") { 
               adjustHeightFor(record.target) // Comment response hidden
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
            popup(record.target) // comment edit popups
         } else if (record.target.className == "comment-dropdown") {
            popdown(record.target)
         } else if (record.target.className == "read-more-content") {
            adjustHeightFor(record.target)
         }
      }
   }
}

adjustHeightFor = (element) => {
   while (element && element.className != "comment-wrapper comment-sub")
      element = element.parentElement
   if (!element) return
   element.style.transition = "max-height 0s ease 0s"
   element.style.maxHeight = element.scrollHeight + 'px';
   element.offsetHeight; // https://stackoverflow.com/a/34726346 not even mad at this point
   element.style.transition = `max-height ${OPTIONS.animationSpeed}ms ease 0s`
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

newSubComment = (subcom) => {
   makeCollapsableSub(subcom.firstChild)
   root = findParent(subcom, (e) => {return e.parentElement.className == "comments"})
   root = root.querySelectorAll('.comment-wrapper')[0];
   button = root.querySelector(".collapse-button")
   if (! button) {
      makeCollapsableRoot(root)
   }
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
   elem.style.transition = `max-height ${OPTIONS.animationSpeed}ms linear`
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
   elem.style.transition = `filter ${OPTIONS.animationSpeed}ms linear`
   content = elem.querySelector(".read-more")
   content.style.transition = `all ${OPTIONS.animationSpeed}ms linear`
   const newProfileLink = `<div class="collapse-wrapper">${oldProfileLink.outerHTML}<div class="comment-avatar collapse-button"/></div>`
   oldProfileLink.remove()
   art = elem.querySelector(".comment")
   art.insertAdjacentHTML("afterbegin", newProfileLink)
   button = elem.querySelector(".collapse-button")
   button.style.transition = `transform ${OPTIONS.animationSpeed}ms linear`
   button.addEventListener('click', collapseThread)

   image = elem.querySelector(".comment-media")      
   if (image) {
      image.style.maxHeight = image.scrollHeight + 'px'; 
      image.style.transition = `max-height ${OPTIONS.animationSpeed}ms linear`
   }
   footer = elem.querySelector(".comment-reply")      
   if (footer) {
      footer.style.transition = `max-height ${OPTIONS.animationSpeed}ms linear`
      footer.style.maxHeight = footer.scrollHeight + 'px';
      HEIGHTS.footer = footer.scrollHeight + 'px';
   }
}

collapseThread = async (event) => {
   thread = findParent(event.currentTarget, (e) => {return e.parentElement.className == "comments"})
   comments = thread.querySelectorAll('.comment-sub')
   collapseRoot(thread.querySelector(".comment-wrapper"))
   for (const subComment of comments) {
      subComment.style.maxHeight = subComment.style.maxHeight == '0px' ? subComment.scrollHeight + 'px' : '0px'
      if (OPTIONS.animationSpeed > 0 ) await new Promise(r => setTimeout(r, 5)) // add some "weight" for longer thread collapse 
   }
}

collapseRoot = (root) => {
   button = root.querySelector(".collapse-button")
   button.style.transform = button.style.transform == '' ? 'rotate(-90deg)' : ''

   content = root.querySelector(".read-more")
   footer = root.querySelector(".comment-reply")
   image = root.querySelector(".comment-media")
   if (button.style.transform == "") {
      if(content.parentElement.querySelector(".read-more-button")) {
         content.style.maxHeight = "300px"
      } else {
         content.style.maxHeight = "none"
      }
      content.style.fontSize = ""
      content.style.color = ""
      if (image) image.style.maxHeight = image.scrollHeight + 'px';
      if (footer) footer.style.maxHeight =  HEIGHTS.footer
      root.style.filter = ""
   } else {
      if (footer) footer.style.maxHeight = '0px';
      if (image) image.style.maxHeight = '0px';
      if (OPTIONS.collapseText) { 
         content.style.maxHeight = "5.8em"
         content.style.fontSize = "12px"
      }
      if (OPTIONS.fade) root.style.filter = "brightness(0.7)"
   }
}

findParent = (startElement, stopCondition) => {
   while (startElement && !stopCondition(startElement))
      startElement = startElement.parentElement
   return startElement
}

window.onload = async (event) => {
   OPTIONS = await browser.storage.sync.get({
      fade: false,
      collapseText: true,
      animationSpeed: '81'
   })

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
