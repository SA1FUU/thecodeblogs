

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-auth.js";
import { getDatabase, set, ref, get, remove, update } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-database.js";
import { getStorage, ref as imgRef, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.6.0/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyAl4gLv8Jtc3ZiIq_k70lJZXxeggXKra0M",
    authDomain: "basicblog-5b58c.firebaseapp.com",
    databaseURL: "https://basicblog-5b58c-default-rtdb.firebaseio.com",
    projectId: "basicblog-5b58c",
    storageBucket: "basicblog-5b58c.appspot.com",
    messagingSenderId: "242631385678",
    appId: "1:242631385678:web:7de237fad09f68fe66d91f"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app);


// On Auth State Change

const admin = document.getElementById('user')

onAuthStateChanged(auth, (user) => {
    if (user) {
        HideLoginShowDashboard()
        admin.style.display = 'block'
    } else {
        ShowLoginHideDashboard()
    }
})

// Function to Show and Hide Login Form and Dashboard

function HideLoginShowDashboard() {
    document.getElementById('login').style.display = "none"
    document.getElementById('dashboard').classList.remove('hide-dashboard')
}
function ShowLoginHideDashboard() {
    document.getElementById('login').style.display = "block"
    document.getElementById('dashboard').classList.add('hide-dashboard')
    document.getElementById('email').value = ''
    document.getElementById('password').value = ''
}


// Admin Log In

function AdminLogin() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    signInWithEmailAndPassword(auth, email, password).then((adminCredinals) => {
        DisplayMessage('Logged in to Admin Dashboard')
    }).catch((error) => {
        DisplayMessage(error.message)
    })
}


const loginForm = document.querySelector('.login')

loginForm.addEventListener('submit', (e) => {
    e.preventDefault()
    AdminLogin()
})

// Toggle Password on Click

const closeEye = document.getElementById('closeEye')
const openEye = document.getElementById('openEye')
const password = document.getElementById('password')

openEye.addEventListener('click', () => {
    if (password.type == 'password') {
        password.type = 'text'
        closeEye.style.display = 'block'
    }
    openEye.style.display = 'none'
})

closeEye.addEventListener('click', () => {
    if (password.type == 'text') {
        password.type = 'password'
        openEye.style.display = 'block'
    }
    closeEye.style.display = 'none'
})

// Log Out

const logoutBtn = document.getElementById('logout')

logoutBtn.addEventListener('click', () => {
    signOut(auth).then(() => {
        DisplayMessage('Logged Out of Admin Dashboard')
        ShowLoginHideDashboard()
    }).catch(() => {
        DisplayMessage('Could not Log Out')
    })
})


// Preview Image on Selecting in Post Blog Form

document.addEventListener("DOMContentLoaded", function () {
    var fileInput = document.getElementById('image');

    fileInput.addEventListener('change', function (event) {
        var file = event.target.files[0];
        if (file) {
            var reader = new FileReader();
            reader.onload = function (e) {
                var imgElement = document.createElement('img');
                imgElement.src = e.target.result;
                var imagePreview = document.getElementById('imagePreview');
                imagePreview.innerHTML = '';
                imagePreview.appendChild(imgElement);
            };
            reader.readAsDataURL(file);
        }
    });
});




const postBlogBtn = document.getElementById('postBlogBtn');

function PostNewBlog() {
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    const author = document.getElementById('author').value;
    // const imageurl = document.getElementById('imageurl').value;
    const id = Math.floor(Math.random() * 100000);
    const date = new Date();

    let day = date.getDate();
    if (day < 10) day = '0' + day;
    let month = date.getMonth() + 1;
    if (month < 10) month = '0' + month;

    let hour = date.getHours();
    if (hour < 10) hour = '0' + hour;
    let minute = date.getMinutes();
    if (minute < 10) minute = '0' + minute;

    const file = document.getElementById('image').files[0];
    if (file) {
        const storageRef = imgRef(storage, 'blogImages/' + id);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.then((snapshot) => {
            return getDownloadURL(snapshot.ref);
        }).then((downloadUrl) => {
            const currentDate = `${day}/${month}/${date.getFullYear()}`;
            const currentTime = `${hour}:${minute}`;

            if (title == '' || content == "" || author == '') {
                DisplayMessage("Fill The Required Fields");
            } else {
                set(ref(db, 'myblogs/' + id), {
                    title: title,
                    content: content,
                    date: currentDate,
                    time: currentTime,
                    author: author,
                    src: downloadUrl,
                    // imageSrc: imageurl
                }).then(() => {
                    GetPostData();
                    ToggleBlogForm();
                    DisplayMessage('New Blog Posted');
                    document.getElementById('title').value = "";
                    document.getElementById('content').value = "";
                    document.getElementById('image').value = "";
                }).catch((error) => {
                    console.error('Error posting blog:', error);
                    DisplayMessage('Error posting blog. Please try again.');
                });
            }
        }).catch((error) => {
            console.error('Error uploading file:', error);
            DisplayMessage('Error uploading file. Please try again.');
        });
    }
    else {
        const currentDate = `${day}/${month}/${date.getFullYear()}`;
        const currentTime = `${hour}:${minute}`;

        if (title == '' || content == "" || author == '') {
            DisplayMessage("Fill The Required Fields");
        } else {
            set(ref(db, 'myblogs/' + id), {
                title: title,
                content: content,
                date: currentDate,
                time: currentTime,
                author: author,
            }).then(() => {
                GetPostData();
                ToggleBlogForm();
                DisplayMessage('New Blog Posted');
                document.getElementById('title').value = "";
                document.getElementById('content').value = "";
                document.getElementById('image').value = "";
            }).catch((error) => {
                console.error('Error posting blog:', error);
                DisplayMessage('Error posting blog. Please try again.');
            });
        }
    }
}

postBlogBtn.addEventListener('click', (e) => {
    e.preventDefault();
    PostNewBlog();
});


// Get Blog Data on The Admin Dashboard 


async function GetPostData() {
    ShowAdminLoader()
    const blog_ref = ref(db, 'myblogs/')
    await get(blog_ref).then((snapshot) => {
        const blogs = snapshot.val()

        let container = "";

        const myBlogs = document.getElementById('myBlogs')
        for (const key in blogs) {
            let { title, content, date, time, src, author, imageSrc } = blogs[key]

            if (title.length > 20) title = title.slice(0, 25) + '...'
            if (content.length > 40) content = content.slice(0, 35) + '...'
            if (author == undefined) author = ' '

            container += `            
                 <div class="blog">
                       <div class="blog-img">
                              <div class="time-author">
                                  <span id="dateTime"><i class="fa-solid fa-pen-to-square"></i> ${author}</span>
                                  <span id="dateTime"><i class="fa-solid fa-clock"></i> ${date} | ${time} </span>
                               </div>
                            <img src="${src}"  id="blogImg" alt='${key}'>  
                        </div>
                        <div class="blog-conts">
                           <h2>${title}</h2>
                           <p>${content}</p>
                           <div class="btns">
                                <button onclick="DeleteBlog(${key})" title="Delete Blog"><i class="fa-solid fa-trash"></i>  </button>
                                <button onclick="UpdateBlog(${key})" title="Update Blog"><i class="fa-solid fa-pen-to-square"></i>  </button>
                                <button onclick="VisitBlog(${key})" title="Visit Blog"><i class="fa-solid fa-right-to-bracket"></i> </button>
                            </div>                    
                       </div>
                </div>
               `
            window.VisitBlog = function (key) {
                localStorage.setItem('blogId', key)
                window.location.href = 'blog.html'
            }
        }
        myBlogs.innerHTML = container
        ShowAdminLoader()
    })
}

GetPostData()


// Function To Delete the Blog

let delContainer = document.getElementById('deleteAlert')
let yesBtn = document.getElementById('yes')
let noBtn = document.getElementById('no')

window.DeleteBlog = function (key) {
    localStorage.setItem('blogIdForDel', key)

    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const delContainerHeight = delContainer.clientHeight;

    const verticalOffset = Math.max(0, (windowHeight - delContainerHeight) / 2 + scrollY);

    delContainer.style.top = verticalOffset + 'px';

    delContainer.style.display = 'block'
    document.getElementById('myBlogsCont').style.filter = 'blur(10px)'
    document.getElementById('myBlogsCont').style.pointerEvents = 'none'
}

noBtn.addEventListener('click', () => {
    delContainer.style.display = 'none'
    document.getElementById('myBlogsCont').style.filter = 'blur(0)'
    document.getElementById('myBlogsCont').style.pointerEvents = 'all'
})

yesBtn.addEventListener('click', async function () {
    let key = localStorage.getItem('blogIdForDel')
    await remove(ref(db, `myblogs/${key}`))
    delContainer.style.display = 'none'
    document.getElementById('myBlogsCont').style.filter = 'blur(0)'
    document.getElementById('myBlogsCont').style.pointerEvents = 'all'
    DisplayMessage("Blog Deleted")
    GetPostData()
})



// Function to Update the Blog


window.UpdateBlog = async function (key) {
    const blogRef = ref(db, `myblogs/${key}`);

    let src
    await get(blogRef).then((snapshot) => {
        const blog = snapshot.val();
        document.getElementById('title').value = blog.title;
        document.getElementById('content').value = blog.content;
        document.getElementById('author').value = blog.author;
        // document.getElementById('imageurl').value = blog.src;
        src = blog.src
    });
    // console.log('outside : ', src);

    document.getElementById('postBlogBtn').style.display = 'none';
    document.getElementById('updateBlogBtn').style.display = 'block';
    document.getElementById('formh2').textContent = 'Update Blog';
    ToggleBlogForm();

    async function UpdateForm() {
        const title = document.getElementById('title').value;
        const content = document.getElementById('content').value;
        const author = document.getElementById('author').value;

        // const imageUrl = document.getElementById('imageurl').value;
        const dateAndTime = new Date();

        let day = dateAndTime.getDate();
        if (day < 10) day = '0' + day;
        let month = dateAndTime.getMonth() + 1;
        if (month < 10) month = '0' + month;
        const year = dateAndTime.getFullYear();
        let hour = dateAndTime.getHours();
        if (hour < 10) hour = '0' + hour;
        let minute = dateAndTime.getMinutes();
        if (minute < 10) minute = '0' + minute;

        const file = document.getElementById('image').files[0];
        if (file) {
            const storageRef = imgRef(storage, 'blogImages/' + key);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.then((snapshot) => {
                return getDownloadURL(snapshot.ref);
            }).then((downloadUrl) => {
                const currentDate = `${day}/${month}/${year}`;
                const currentTime = `${hour}:${minute}`;

                if (title == '' || content == "" || author == '') {
                    DisplayMessage("Fill The Required Fields");
                } else {
                    update(ref(db, `myblogs/${key}`), {
                        title: title,
                        content: content,
                        date: currentDate,
                        time: currentTime,
                        src: downloadUrl,
                        author: author
                        // imageSrc: imageUrl
                    });
                    GetPostData();
                    ToggleBlogForm();
                    DisplayMessage('Blog Updated');
                    document.getElementById('title').value = "";
                    document.getElementById('content').value = "";
                    document.getElementById('image').value = "";
                    // document.getElementById('imageurl').value = "";
                }
            }).catch((error) => {
                console.error('Error uploading file:', error);
            });
        }
        else {
            const currentDate = `${day}/${month}/${year}`;
            const currentTime = `${hour}:${minute}`;

            if (title == '' || content == "" || author == '') {
                DisplayMessage("Fill The Required Fields");
            } else {
                await update(ref(db, `myblogs/${key}`), {
                    title: title,
                    content: content,
                    date: currentDate,
                    time: currentTime,
                    author: author
                    // src: src,
                    // imageSrc: imageUrl
                });
                console.log('outside', src);
                GetPostData();
                ToggleBlogForm();
                DisplayMessage('Blog Updated');
                document.getElementById('title').value = "";
                document.getElementById('content').value = "";
                document.getElementById('image').value = "";
                // document.getElementById('imageurl').value = "";
            }
        }

        document.getElementById('postBlogBtn').style.display = 'block';
        document.getElementById('updateBlogBtn').style.display = 'none';
        document.getElementById('formh2').textContent = 'Post a New Blog';
    }

    document.getElementById('updateBlogBtn').addEventListener('click', (e) => {
        e.preventDefault();
        UpdateForm();
    });
};


// / Get Data from firebase Database to Home Page

async function GetBlogtData() {
    ShowLoader()
    const blog_ref = ref(db, 'myblogs/')
    await get(blog_ref).then((snapshot) => {
        const blogs = snapshot.val()

        let container = "";

        const myBlogs = document.getElementById('mainBlogsCont')
        for (const key in blogs) {
            let { title, content, date, src, author } = blogs[key]

            if (title.length > 25) title = title.slice(0, 30) + '...'
            if (content.length > 100) content = content.slice(0, 100) + '...'

            container += `            
            <div class="main-blog">
                  <h2>${title}</h2>
                  <div class="main-img">
                       <img src="${src}" alt="blogImage/${key}">
                  </div>
                  <div class="blog-description">
                    <span id="date-author">By ${author} on ${date} </span>
                    <p>${content}</p>
                    <a  id="readBlogBtn" onclick="GetBlogId(${key})" class="readBlogBtn">Read Blog <i class="fa-solid fa-caret-right"></i></a>
                  </div>
            </div>
               `
            window.GetBlogId = function (key) {
                localStorage.setItem('blogId', key)
                window.location.href = 'blog.html'
            }
        }
        myBlogs.innerHTML = container
        HideLoader()
    })
}


// Firing the Function to Get Data only When the User Has Scrolled More Than 100vh

let scrolled100vh = false;

function handleScrollForBlogData() {
    if (!scrolled100vh && window.scrollY > window.innerHeight * 0.7) {
        GetBlogtData()
        scrolled100vh = true;
    }
}

function handleScrollForDownArrow() {
    if (window.scrollY > window.innerHeight * 0.4) {
        document.querySelector('.fa-chevron-down').style.display = 'none'
    } else {
        document.querySelector('.fa-chevron-down').style.display = 'block'
    }
}

window.addEventListener('scroll', handleScrollForBlogData);
window.addEventListener('scroll', handleScrollForDownArrow);




// Functions To Show And Hide Loader

function ShowLoader() {
    document.getElementById('loader').classList.toggle('hideLoader')
}
function HideLoader() {
    document.getElementById('loader').classList.toggle('hideLoader')
}

function ShowAdminLoader() {
    document.getElementById('adminLoader').classList.toggle('hideAdminLoader')
}
function HideAdminLoader() {
    document.getElementById('adminLoader').classList.toggle('hideAdminLoader')
}


// Show Admin Dashboard from URL

document.addEventListener("DOMContentLoaded", function () {
    let currentURL = window.location.href
    if (currentURL.includes('admin')) {
        ShowAdminDashboard()
    }
});


function ShowAdminDashboard() {
    document.getElementById('adminDashboard').classList.remove('hide-admin-dashboard')
    document.querySelector('main').style.display = 'none'
}

admin.addEventListener('click', () => {
    let currentURL = window.location.href
    window.location.href = currentURL + '?admin'
})

// Close Admin Dashboard on Click of Close Button

function CloseAdminDashOnClick() {
    let currentURL = window.location.href
    if (currentURL.includes('?admin')) {
        window.location.href = currentURL.split('?admin').join('')
    }
}

document.getElementById('closeAdmin').addEventListener('click', CloseAdminDashOnClick)

// Function to Create and Fire a Alert Box

function DisplayMessage(message) {
    let body = document.querySelector('body')
    let div = document.createElement('div')
    div.classList.add('alert')
    let btn = document.createElement('button')
    btn.classList.add('fa-solid', 'fa-x')
    let h5 = document.createElement('h5')
    h5.innerText = message
    body.append(div)
    div.append(h5)
    div.append(btn)
    btn.addEventListener('click', () => {
        body.removeChild(div)
    })
    setTimeout(() => {
        body.removeChild(div)
    }, 3500)
}

// Function to Close Login Form

document.getElementById('closeLogin').addEventListener('click', () => {
    CloseAdminDashOnClick()
    document.title = 'The Code Blogs - Home'
})


// Toggle Blog Form

const newBlogBtn = document.getElementById('newBlogBtn')

function ToggleBlogForm() {
    postBlogForm.classList.toggle('hideBlogForm')
    if (newBlogBtn.innerHTML.includes('fa-plus')) {
        newBlogBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>'
    }
    else {
        newBlogBtn.innerHTML = '<i class="fa-solid fa-plus"></i>'
    }
}

newBlogBtn.addEventListener('click', () => ToggleBlogForm())

// Typing Animation

var typed = new Typed('#element', {
    strings: ['Technology, Trends and Insights '],
    typeSpeed: 50,
    loop: true
});


// Toggle Navbar

const closeNav = document.getElementById('closeNav')
const burger = document.getElementById('burger')
const nav = document.querySelector('nav')

burger.addEventListener('click', () => {
    nav.classList.remove('hideNav')
})

closeNav.addEventListener('click', () => {
    nav.classList.add('hideNav')
})

window.addEventListener('scroll', function () {
    if (window.scrollY > 100) {
        closeNav.click()
        HideContactForm()
        delContainer.style.display = 'none'
        document.getElementById('myBlogsCont').style.filter = 'blur(0)'
        document.getElementById('myBlogsCont').style.pointerEvents = 'all'
    }
});


// Newsletter

const newsForm = document.getElementById('newsForm')
const newsEmail = document.getElementById('newsEmail')


newsForm.addEventListener('submit', (e) => {
    e.preventDefault()
    const id = Math.floor(Math.random() * 30000)
    if (newsEmail.value !== '') {
        set(ref(db, 'userEmail/' + id), {
            email: newsEmail.value
        }).then(() => {
            DisplayMessage('Thank You For Subscribing')
        }).catch((error) => {
            DisplayMessage(error.message);
        });
        newsEmail.value = ''
    }
    else {
        DisplayMessage('Enter Email First')
    }
})

let scrollPosition = 0;

document.getElementById('blogs').addEventListener('click', (e) => {
    e.preventDefault()
    scrollPosition = window.innerHeight * 0.95;
    window.scrollTo({
        top: scrollPosition,
        left: 0,
        behavior: 'smooth'
    });
});

document.getElementById('home').addEventListener('click', (e) => {
    e.preventDefault(),
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth'
        });
});


// Adding Active class on Nav link on Click

document.addEventListener("DOMContentLoaded", function () {
    const navLinks = document.querySelectorAll("nav a li");
    navLinks.forEach(function (link) {
        link.addEventListener("click", function (event) {
            navLinks.forEach(function (link) {
                link.classList.remove("active");
                nav.classList.add('hideNav')
            });
            event.target.classList.add("active");
        });
    });
});


// Contact Form

function ShowContactForm() {
    document.getElementById('contactDiv').classList.remove('hidecontactDiv')
    document.querySelector('main').style.filter = 'blur(10px)'
    document.querySelector('main').style.pointerEvents = 'none'
}

function HideContactForm() {
    document.getElementById('contactDiv').classList.add('hidecontactDiv')
    document.getElementById('contact').classList.remove('active')
    document.querySelector('main').style.filter = 'blur(0)'
    document.querySelector('main').style.pointerEvents = 'all'
}

document.getElementById('contact').addEventListener('click', () => {
    ShowContactForm()
})

document.getElementById('closeContact').addEventListener('click', () => {
    HideContactForm()
})

// Handle Contact Form

const conForm = document.getElementById('conForm')

conForm.addEventListener('submit', (e) => {
    e.preventDefault()
    const name = document.getElementById('conName').value
    const email = document.getElementById('conEmail').value
    const message = document.getElementById('conMessage').value
    const id = Math.floor(Math.random() * 30000)

    if (name === '' || email === '' || message === '') {
        DisplayMessage('Fill The Required Fields')
    }
    else {
        set(ref(db, 'contactDetails/' + id), {
            name: name,
            email: email,
            message: message
        }).then(() => {
            DisplayMessage('Thanks, We Will Get in Touch Soon')
        }).catch((error) => {
            DisplayMessage(error.message);
        });
        document.getElementById('conName').value = ''
        document.getElementById('conEmail').value = ''
        document.getElementById('conMessage').value = ''
        HideContactForm()
    }
})