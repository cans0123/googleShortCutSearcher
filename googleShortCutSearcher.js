document.selectedResultId = 0;

function selectResult(newId) {
    els = document.getElementsByTagName("h3");
    els = filterSearchElements(els);
    if (newId < 0 || newId >= els.length) {
        return
    }
    removeResultPointer()
    document.selectedResultId = newId;
    el = els[newId];
    window.scrollTo({top: findPos(el) - 300, behavior: 'smooth'});
    lnk = el.firstElementChild;
    el.innerHTML = "<div id=\"result-pointer\" style=\"position:absolute;left:-15px;\">&gt;</div>" + el.innerHTML;
    lnk.focus();
}

document.onkeyup = function (event) {
    if (event.keyCode === 9) {
        if (isShortKeyModeOn()) {
            // Tab
            turnOffShortKeyMode();
            removeResultPointer()
        } else {
            turnOnShortKeyMode();
            selectResult(document.selectedResultId);
        }
    }
    // shortKeyMode is activated only by the "Tab" button
    if (!isShortKeyModeOn()) {
        return
    }
    if (event.keyCode === 38) {
        // Arrow up
        selectResult(document.selectedResultId - 1);
    }
    if (event.keyCode === 40) {
        // Arrow down
        selectResult(document.selectedResultId + 1);
    }
    if (event.ctrlKey && event.keyCode === 37) {
        // Arrow left (previous page)
        var previousPageElement = getPreviousPageElement();
        if (previousPageElement) {
            document.location = previousPageElement.href;
        }
    }
    if (event.ctrlKey && event.keyCode === 39) {
        // Arrow right (next page)
        var nextPageElement = getNextPageElement();
        if (nextPageElement) {
            document.location = nextPageElement.href;
        }
    }
    if (event.keyCode === 13 && getResultPointer()) {
        // Enter
        // Go to page only if page selected (result-pointer exist)
        var el = document.querySelectorAll("h3")[document.selectedResultId];
        var lnk = el.parentElement;
        var url = lnk.href;
        if (event.ctrlKey) {
            var win = window.open(url, "_blank");
            win.blur();
            window.open().close();
        } else {
            document.location = url;
        }
    }
    if (event.keyCode === 84) {
        // "t" (text) - Change searching phrase
        getSearchInputElement().focus();
        turnOffShortKeyMode();
        removeResultPointer();
        window.scrollTo({top: 0, behavior: 'smooth'});
    }
}

function isShortKeyModeOn() {
    return ("true" == localStorage.getItem("shortKeyIsOn")) && getResultPointer();
}

function turnOnShortKeyMode() {
    localStorage.setItem("shortKeyIsOn", true);
}

function turnOffShortKeyMode() {
    localStorage.setItem("shortKeyIsOn", false);
}

function removeResultPointer() {
    rp = getResultPointer();
    if (rp != null) {
        rp.remove();
    }
}

function getResultPointer() {
    return document.getElementById("result-pointer");
}

function findPos(obj) {
    var curtop = 0;
    if (obj.offsetParent) {
        do {
            curtop += obj.offsetTop;
        } while (obj = obj.offsetParent);
        return [curtop];
    }
}

function filterSearchElements(els) {
    filteredEls = [];
    for (el of els) {
        if (needElementAdded(el)) {
            filteredEls.push(el);
        }
    }
    return filteredEls;
}

function getNextPageElement() {
    return findElementByText("Следующая");
}

function getPreviousPageElement() {
    return findElementByText("Предыдущая");
}

function getSearchInputElement() {
    return findElementByXpath("//input[@type='text']");
}

function findElementByText(text) {
    return findElementByXpath("//a[contains(., '" + text + "')]");
}

function findElementByXpath(xpath) {
    return document.evaluate(xpath, document, null, XPathResult.ANY_TYPE, null).iterateNext();
}

function needElementAdded(element) {
    if (element.textContent.endsWith("часто ищут")) {
        return false;
    }
    var parents = getParentElements(element);
    if (parents.length !== 16) {
        return false;
    }
    var parentHierarchyElements = parents.concat([element]);
    for (hierarchyElement of parentHierarchyElements) {
        if (hierarchyElement.getAttribute("aria-level")) {
            return false;
        }
        // check element include in hidden group ("Похожие запросы:")
        for (children of hierarchyElement.children) {
            if (isHasSimilarQuery(children)) {
                return false;
            }
        }
    }
    return true;
}

function getParentElements(element) {
    allClassNames = [];
    parent = element;
    while (parent) {
        parent = parent.parentElement;
        if (parent) {
            allClassNames.push(parent);
        }
    }
    return allClassNames;
}

function isHasSimilarQuery(element) {
    return element.textContent == "Похожие запросы";
}