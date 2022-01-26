const apiUrl = "http://94.40.79.249/api/";

let myUser = {
    id: 0,
    login: "",
    avatar_url: ""
};

let myStatus = "Online";

let selectedUser = {
    id: 0,
    login: "",
    avatar_url: ""
}

let lastMessage = 0;

let contacts = [];

let updateTimeout;
let searchTimeout;


function getEl(id) {
    return document.getElementById(id);
}
function getVal(id) {
    return document.getElementById(id).value;
}
function createEl(tag) {
    return document.createElement(tag);
}
function hideEl(id) {
    document.getElementById(id).style.display = "none";
}
function showEl(id) {
    document.getElementById(id).style.display = "";
}
function clearElChildren(element) {
    while (element.firstChild) {
        element.firstChild.remove();
    }
}

function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
  
    document.body.removeChild(element);
  }


function createMessageEl(message) {
    let messageContainerEl = createEl("div");
    messageContainerEl.className = "MessageContainer";

    let messageEl = createEl("div");

    messageEl.className = 
    (message.id_sender == myUser.id)? 
        "MyMessage": 
        (message.seen)? 
            "UserMessage": 
            "UserMessage Unseen";

    let dateEl = createEl("span");
    dateEl.className = "Date";
    dateEl.innerText = (new Date(message.date)).toDateString();
    messageEl.append(dateEl);

    let textEl = createEl("span");
    textEl.className = "Text";
    textEl.innerText = message.text;
    messageEl.append(textEl);

    messageContainerEl.append(messageEl);

    return messageContainerEl;
}

function createUserEl(user, type) {
    let userEl = createEl("div");
    userEl.onclick = () => {
        selectedUser = user;
        loadSelectedUser();
    };

    let avatarEl = createEl("img");
    avatarEl.src = user.avatar_url || "avatar.png";
    userEl.append(avatarEl);

    let loginEl = createEl("span");
    loginEl.innerText = user.login;
    userEl.append(loginEl);

    if (type == "contact") {
        let statusEl = createEl("div");
        statusEl.className = "Status " + user.status;
        userEl.append(statusEl);

        if (user.text) {
            let messageEl = createEl("span");
            messageEl.className = "ContactMessage";
            const text = (user.text.length <= 30)? user.text: user.text.substr(0, 27) + "...";
            messageEl.innerText = text;
            userEl.append(messageEl);
        }
    }

    return userEl;
}

function loadContacts(users) {
    let nonContactsEl = getEl("nonContactMessages");
    clearElChildren(nonContactsEl);
    let contactsEl = getEl("contacts");
    clearElChildren(contactsEl);

    contacts = [];
    users.forEach(user => {
        if (user.contact) {
            contacts.push(user);
            contactsEl.append(createUserEl(user, "contact"));
        } else {
            nonContactsEl.append(createUserEl(user, "contact"));
        }
    });
}

function update() {
    const body = {
        selected_user: selectedUser.id,
        comment_id: lastMessage
    };

    fetch(apiUrl + "messages/update", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body)
    })
    .then(response => response.json())
    .then(data => {
        if (Array.isArray(data.users)) {
            loadContacts(data.users);
            loadChatMessages(data.selectedUserMessages);
            updateTimeout = setTimeout(update, 5000);
        } else {
            alert(data.error);
        }
    })
    .catch((error) => {
        console.error("Error:", error);
    });
}


function addContact() {
    const body = {
        contact_id: selectedUser.id,
    };

    fetch(apiUrl + "users/addcontact", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body)
    })
    .then(response => response.json())
    .then(data => {
        if (data.id) {
            let el = getEl("addDelContact");
            el.innerText = "Delete";
            el.onclick = deleteContact;
        } else {
            alert(data.error);
        }
    })
    .catch((error) => {
        console.error("Error:", error);
    });
}

function deleteContact() {
    const body = {
        contact_id: selectedUser.id,
    };

    fetch(apiUrl + "users/deletecontact", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body)
    })
    .then(response => response.json())
    .then(data => {
        if (data.id) {
            let el = getEl("addDelContact");
            el.innerText = "Add";
            el.onclick = addContact;
        } else {
            alert(data.error);
        }
    })
    .catch((error) => {
        console.error("Error:", error);
    });
}

function loadChatMessages(messages) {
    let messagesEl = getEl("messages");
    messages.forEach(message => {
        messagesEl.append(createMessageEl(message));
    });

    if (messages.length > 0) {
        lastMessage = messages[messages.length - 1].id;
    }
}

function parseAndDownloadConversation(messages) {
    if (!messages) {
        alert("There are no messages");
        return;
    }

    let text = "";
    let lastSender = messages[0].id_sender;

    messages.forEach(message => {
        if (message.id_sender != lastSender) {
            text += "\n";
            lastSender = message.id_sender;
        }
        
        text += message.date + "\n" + message.text + "\n";
    });
    
    download("conversation.txt", text);
}

function getChatMessages(mode) {
    fetch(apiUrl + "messages/user/" + selectedUser.id, {
        method: "GET"
    })
    .then(response => response.json())
    .then(data => {
        if (Array.isArray(data)) {
            if (mode == "display") {
                clearElChildren(getEl("messages"));
                loadChatMessages(data);
            } else if (mode = "download") {
                parseAndDownloadConversation(data);
            }
        } else {
            alert(data.error);
        }
    })
    .catch((error) => {
        console.error("Error:", error);
    });
}

function loadSelectedUser() {
    const url = selectedUser.avatar_url || "avatar.png";
    getEl("userAvatar").src = url;
    getEl("userName").innerText = selectedUser.login;

    let el = getEl("addDelContact");
    const found = contacts.find(contact => contact.id == selectedUser.id);
    if (found) {
        el.innerText = "Delete";
        el.onclick = deleteContact;
    } else {
        el.innerText = "Add";
        el.onclick = addContact;
    }

    getEl("downloadConversation").onclick = downloadConversation;

    showEl("chat");

    getChatMessages("display");
}

function downloadConversation() {
    getChatMessages("download");
}


function showSearchUserList(users) {
    let searchUserList = getEl("searchUserList");
    clearElChildren(searchUserList);
    users.forEach(user => {
        searchUserList.append(createUserEl(user));
    });
}

function searchUserFetch(login) {
    fetch(apiUrl + "users/search?login=" + login, {
        method: "GET"
    })
    .then(response => response.json())
    .then(data => {
        if (Array.isArray(data)) {
            showSearchUserList(data);
        } else {
            alert(data.error);
        }
    })
    .catch((error) => {
        console.error("Error:", error);
    });
}

function searchUser() {
    const login = getVal("searchUser");
    if (login) {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            searchUserFetch(login);
        }, 1000);
    } else {
        clearElChildren(getEl("searchUserList"));
        clearTimeout(searchTimeout);
    }
}


function loadAvatar() {
    const url = myUser.avatar_url || "avatar.png";
    getEl("avatar").src = url;
}

function loadStatus() {
    getEl("myStatus").className = "Status " + myStatus;
}

function loadAccount() {
    hideEl("cover");
    hideEl("loginWindow");
    loadAvatar();
    loadStatus();
    update();
}


function sign(endpoint) {
    const login = getVal("userLogin");
    const password = getVal("userPassword");
    if (login && password) {
        const body = { 
            login: login,
            password: password
        };

        fetch(apiUrl + endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body)
        })
        .then(response => response.json())
        .then(data => {
            if (data.id) {
                myUser = data;
                loadAccount();
            } else {
                alert(data.error);
            }
        })
        .catch((error) => {
            console.error("Error:", error);
        });
        
    } else {
        alert("Type in login and password");
    }
}

function signIn() {
    sign("account/login");
}

function signUp() {
    sign("account/register");
}

function logOut() {
    fetch(apiUrl + "account/logout", {
        method: "GET"
    })
    .then(response => response.json())
    .then(data => {
        if (data.id) {
            location.reload();
        } else {
            alert(data.error);
        }
    })
    .catch((error) => {
        console.error("Error:", error);
    });
}


function changeAvatar() {
    const input = prompt("Enter new avatar url");
    if (input != null) {
        const body = { 
            avatar_url: input
        };

        fetch(apiUrl + "account/changeavatar", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body)
        })
        .then(response => response.json())
        .then(data => {
            if (data.id) {
                myUser.avatar_url = input;
                loadAvatar();
            } else {
                alert(data.error);
            }
        })
        .catch((error) => {
            console.error("Error:", error);
        });
    }
}

function setStatus(status) {
    const body = { 
        status: status
    };

    fetch(apiUrl + "account/setstatus", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body)
    })
    .then(response => response.json())
    .then(data => {
        if (data.id) {
            myStatus = status;
            loadStatus();
        } else {
            alert(data.error);
        }
    })
    .catch((error) => {
        console.error("Error:", error);
    });
}


function sendMessage() {
    if (!selectedUser.id) {
        alert("No user selected");
        return;
    }

    const newMessage = getVal("newMessage");
    if (!newMessage) {
        return;
    }

    const body = {
        id_receiver: selectedUser.id,
        text: newMessage
    };

    fetch(apiUrl + 'messages/send', {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body)
    })
    .then(response => response.json())
    .then(data => {
        if (data.id) {
            lastMessage = data.id;
            getEl("newMessage").value = "";
            const message = {
                id: data.id,
                id_sender: myUser.id,
                text: body.text,
                date: Date(),
                seen: 0
            };
            getEl("messages").append(createMessageEl(message));
        } else {
            alert(data.error);
        }
    })
    .catch((error) => {
        console.error("Error:", error);
    });
}


function getAccount() {
    fetch(apiUrl + "account", {
        method: "GET"
    })
    .then(response => response.json())
    .then(data => {
        if (data.id) {
            myUser = data;
            loadAccount();
        } else {
            showEl("cover");
            showEl("loginWindow");
        }
    })
    .catch((error) => {
        console.error("Error:", error);
    });
}


getAccount();