function createElemWithText(e = "p", tc = "", cn) {
    const newEle = document.createElement(e);
    newEle.textContent = tc;
    if(!cn) {
        return newEle;
    }
    else {
        newEle.className = cn;
        return newEle;
    }
}

function createSelectOptions(users) {
    if(!users) {
        return undefined;
    }
    let arr = [];
    users.forEach((user) => {
        const op = document.createElement('option');
        op.value = user.id;
        op.textContent = user.name;
        arr.push(op);
    });
    return arr;
}

function toggleCommentSection(postId) {
    if(!postId) {
        return undefined;
    }
    let section = document.querySelector(`section[data-post-id="${postId}"]`);
    if(!section) {
        return null;
    }
    let classes = section.classList;
    classes.toggle('hide');
    return section;
}

function toggleCommentButton(postId) {
    if(!postId) {
        return undefined;
    }
    let button = document.querySelector(`button[data-post-id="${postId}"]`);
    if(!button) {
        return null;
    }
    if(button.textContent == 'Show Comments') {
        button.textContent = 'Hide Comments';
    }
    else {
        button.textContent = 'Show Comments'
    }
    return button;
}

function deleteChildElements(parentElement) {
    if(parentElement instanceof HTMLElement) {
        let child = parentElement.lastElementChild;
        while(child != undefined) {
        parentElement.removeChild(child);
        child = parentElement.lastElementChild;
        }
        return parentElement;
    }
    else {
        return undefined;
    }
}

function addButtonListeners() {
    let ele = document.querySelector('main');
    let buttons = ele.querySelectorAll('button');
    if(!buttons) {
        return undefined;
    }
    buttons.forEach((button) => {
        let postId = button.dataset.postId;
        button.addEventListener('click', function(e) {toggleComments(e, postId)});
    })
    return buttons;
}

function removeButtonListeners() {
    let ele = document.querySelector('main');
    let buttons = ele.querySelectorAll('button');
    if(!buttons) {
        return undefined;
    }
    buttons.forEach((button) => {
        let postId = button.dataset.id;
        button.removeEventListener('click', function(e) {toggleComments(e,postId)});
    })
    return buttons;
}

function createComments(comments) {
    if(!comments) {
        return undefined;
    }
    let fragment = document.createDocumentFragment();
    comments.forEach((comment) => {
        let art = document.createElement('article');
        let h3 = createElemWithText('h3', `${comment.name}`);
        let p1 = createElemWithText('p', `${comment.body}`);
        let p2 = createElemWithText('p', `From: ${comment.email}`);
        art.append(h3, p1, p2);
        fragment.append(art);
    })
    return fragment;
}

function populateSelectMenu(users) {
    if(!users) {
        return undefined;
    }
    let menu = document.getElementById("selectMenu");
    let arr = createSelectOptions(users);
    arr.forEach((obj) => {
        menu.append(obj);
    })
    return menu;
}

async function getUsers() {
    try {
        const response = await fetch("https://jsonplaceholder.typicode.com/users");
        let usersJSON = await response.json();
        return await usersJSON;
    }
    catch{
        return null
    }
}

async function getUserPosts(userId) {
    if(!userId) {
        return undefined;
    }
    try {
        const response = await fetch(`https://jsonplaceholder.typicode.com/posts?userId=${userId}`);
        let userIdPostsJSON = await response.json();
        return userIdPostsJSON;
    }
    catch{
        return null
    }
}

async function getUser(userId) {
    if(!userId) {
        return undefined;
    }
    try {
        const response = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`);
        let userJSON = await response.json();
        return userJSON;
    }
    catch{
        return null
    }
}

async function getPostComments(postId) {
    if(!postId) {
        return undefined;
    }
    try {
        const response = await fetch(`https://jsonplaceholder.typicode.com/comments?postId=${postId}`);
        let postCommentsJSON = await response.json();
        return postCommentsJSON;
    }
    catch{
        return null
    }
}

async function displayComments(postId) {
    if(!postId) {
        return undefined;
    }
    let section = document.createElement('section');
    section.setAttribute("data-post-id", postId);
    section.classList.add("comments", "hide");
    try {
        let comments = await getPostComments(postId);
        let frag = createComments(comments);
        section.append(frag);
        return section;
    }
    catch {
        return null;
    }
}

async function createPosts(posts) {
    if(!posts) {
        return undefined;
    }
    let fragment = document.createDocumentFragment();
    for(let post of posts) {
        let article = document.createElement('article');
        let h2 = createElemWithText('h2', post.title);
        let p1 = createElemWithText('p', post.body);
        let p2 = createElemWithText('p', `Post ID: ${post.id}`);
        let author = await getUser(post.userId);
        let p3 = createElemWithText('p', `Author: ${author.name} with ${author.company.name}`);
        let p4 = createElemWithText('p', `${author.company.catchPhrase}`);
        let button = createElemWithText('button', "Show Comments");
        button.setAttribute("data-post-id", post.id);
        let section = await displayComments(post.id);
        article.append(h2, p1, p2, p3, p4, button, section);
        fragment.append(article);
    }
    return fragment;
}

async function displayPosts(posts) {
    if(!posts) {
        let element = createElemWithText('p', 'Select an Employee to display their posts.', 'default-text');
        return element;
    }
    let main = document.querySelector('main');
    let element = await createPosts(posts);
    main.append(element);
    return element;
}

function toggleComments(event, postId) {
    if(!event || !postId) {
        return undefined;
    }
    event.target.listener = true;
    let section = toggleCommentSection(postId);
    let button = toggleCommentButton(postId);
    let arr = [section, button];
    return arr;
}

async function refreshPosts(posts) {
    if(!posts) {
        return undefined;
    }
    let removeButtons = removeButtonListeners();
    let main = deleteChildElements(document.querySelector('main'));
    let fragment = await displayPosts(posts);
    let addButtons = addButtonListeners();
    let arr = [removeButtons, main, fragment, addButtons];
    return arr;
}

async function selectMenuChangeEventHandler(e) {
    if(e) {
        document.querySelector('#selectMenu').disabled = true;
        let userId = e?.target?.value || 1;
        let posts = await getUserPosts(userId);
        let refreshPostsArray = await refreshPosts(posts);
        document.querySelector('#selectMenu').disabled = false;
        let arr = [userId, posts, refreshPostsArray];
        return arr;
    }
    return undefined;
}

async function initPage() {
    let users = await getUsers();
    let select = populateSelectMenu(users);
    let arr = [users, select];
    return arr;
}

function initApp() {
    initPage();
    const ele = document.querySelector('#selectMenu');
    ele.addEventListener('change', function(e) {selectMenuChangeEventHandler(e)});
}

document.addEventListener('DOMContentLoaded', initApp);