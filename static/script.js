let myLibrary = [];

function Book(title, author, pages_num, been_read) {
	this.title = title;
	this.author = author;
	this.pages_num = pages_num;
	this.been_read = been_read;
	this.info = function() {
		return `
		\n
		AUTHOR: ${this.author}
		TITLE: ${this.title}
		NUMBER OF PAGES: ${this.pages_num}
		BEEN READ: ${this.been_read}			
		\n`;
	}
}

Book.prototype.btnToggleStatus = function() {
	this.been_read = !this.been_read;
	let book = document.querySelector(`.card[data-book-index="${myLibrary.indexOf(this)}"]`);
	book.classList.toggle("success");
}

function addBookToLibrary(book) {
	myLibrary.push(book);
}
function showLibraryBooks() {
	let parent = document.getElementsByClassName("card-container")[0];
	parent.innerHTML = '';
	let bookIndex = 0;
	myLibrary.forEach(book => {
		const card = createCard(book, bookIndex);
		parent.innerHTML += card; 
		bookIndex++;
	})
}

function createCard(book, bookIndex) {
	fillEmptyBookInfo(book);
	const card = 
	`<div class="card" data-book-index=${bookIndex}>
		<div class="info">
			<h2 class="cardTitle"><span>${book.title}</span></h2>
			<h5 class="cardSubTitle">By ${book.author}</h5>
		</div>
		<span>${book.pages_num} pages</span>	
		<div class="flex-container">
			<label class="switch">
				<input type="checkbox" class="btnToggleStatus" ${book.been_read}>
				<span class="slider"></span>
			</label>
			<span class="switchLabel">I have read this book</span>
			<a href="#" class="btn btnDelBook">Delete Book</a>
		</div>
	</div>`;
	return card;
}

function fillEmptyBookInfo(book) {
	if (book.author.trim().length === 0) {
		book.author = "?";
	}
	if (book.title.trim().length === 0) {
		book.title = "?";
	}
	if (book.been_read) {
		book.been_read = "checked";
	} else {
		book.been_read = "";
	}	
	return book;
}

function hasClass(elem, className) {
	return elem.classList.contains(className);
}

window.onclick = e => {
	// card buttons
	if (hasClass(e.target, "btnDelBook") || hasClass(e.target, "btnToggleStatus")) {
		let card; let bookIndex;
		if (hasClass(e.target, "btnToggleStatus")) {
			card = e.target.parentNode.parentNode.parentNode;
			bookIndex = card.dataset.bookIndex;
			const book = myLibrary[bookIndex];
			book.btnToggleStatus(); 
		}
		else {
			card = e.target.parentNode.parentNode;
			bookIndex = card.dataset.bookIndex;
			myLibrary.splice(bookIndex, 1);
		}
		showLibraryBooks();
		e.preventDefault();
	}		
	else if (hasClass(e.target, "modal")) {
		modals.forEach(function(elem) {
			elem.classList.add("hide");
		})
		e.preventDefault();
	}
}

const btnNewBook = document.getElementById("btnNewBook");
const addBookForm = document.getElementsByClassName("form-container")[0];
const btnSubmitBook = document.getElementById("btnSubmitBook");

btnNewBook.onclick = function() {
	addBookForm.classList.add("pullToBottom");
	addBookForm.classList.remove("hide");
}

btnSubmitBook.onclick = function() {
	let newTitle = document.getElementById("newTitle");
	let newAuthor = document.getElementById("newAuthor");
	let newNumPage = document.getElementById("newNumPage");
	let newBeenRead = document.getElementById("newBeenRead");
	newBook = new Book(newTitle.value, newAuthor.value, newNumPage.value, newBeenRead.checked);
	addBookToLibrary(newBook);
	showLibraryBooks();
	let bookForm = document.getElementById("bookForm").reset();
	addBookForm.classList.add("hide");
}

// modals
let modalClose = document.querySelectorAll('.modal-close');
let modals = document.querySelectorAll('.modal');
modalClose.forEach(function(elem) {
	elem.onclick = function() {
		elem.parentNode.parentNode.classList.add("hide");
	}
})
// Library Data

let userConfigWall = document.querySelector(".userConfig");
let userStorageType;

if (localStorage) {
	// clearData();
	loadConfig();
	loadLibrary();
	const localStorageBtn = document.getElementById('localStorageBtn');
	localStorageBtn.onclick = function() {
		userStorageType = "local";
		userConfigWall.classList.add("pullToTop");
		userConfigWall.classList.add("hide");
		saveConfig();
	}	

	function saveConfig() {
		localStorage.setItem("storageType", userStorageType);
	}
	function loadConfig() {
		if (localStorage.getItem("storageType") === "local") {
			userStorageType = localStorage.getItem("storageType");		
		}
	}	
	function saveLibraryLocal() { 
		localStorage.setItem('library', JSON.stringify(myLibrary));
	}
	function loadLibrary() {
		// if tasks data already on local storage
		if (localStorage.getItem("library")) {
			const lib = JSON.parse(localStorage.getItem('library'));
			jsonToLibrary(lib);
		}
	} 
	function clearData() {
		localStorage.removeItem('library');
		localStorage.removeItem('storageType');
	}				
}
function jsonToLibrary(library) {
	for (const key in Object.keys(library)) {
		const savedBook = new Book(library[key].title, library[key].author, library[key].pages_num, library[key].been_read);
		addBookToLibrary(savedBook);
	}
}


// check if user has library data, else assume she's new
if (userStorageType !== "local" && userStorageType !== "cloud"){
	userConfigWall.classList.remove("hide");
}

// cloud storage 

const cloudStorageBtn = document.getElementById('cloudStorageBtn');
const cloudLoginModal = document.getElementById('cloudLoginModal');
cloudStorageBtn.onclick = function() {
	userStorageType = "cloud";
	cloudLoginModal.classList.remove("hide");
	const database = project.database();
}

let currentUserId;
const nav = document.querySelector("nav");
const signOutBtn = document.getElementById("signOutBtn"); 
const signInBtn = document.getElementById("signInBtn");
firebase.auth().onAuthStateChanged(function(user) {
	if (user) {
		signOutBtn.style.display = "block";
		signInBtn.style.display = "none";
		userStorageType = "cloud";
		currentUserId = user.uid;
		loadLibraryCloud(currentUserId);
	}
	else {
		signOutBtn.style.display = "none";
		signInBtn.style.display = "block";
	}
})

signInBtn.onclick = function() {
	cloudLoginModal.classList.remove("hide");
	ui.start('#firebaseui-auth-container', uiConfig);
} 
signOutBtn.onclick = function() {
	firebase.auth().signOut();	
}

function saveLibraryCloud(userId) {
	database.ref('users/' + userId).set(JSON.stringify(myLibrary));
}
function loadLibraryCloud(userId) {
	database.ref('users/' + userId).once('value', function(snapshot) {
		const lib = JSON.parse(snapshot.val());
		jsonToLibrary(lib);
		showLibraryBooks();
	})	
} 
function signOutUser() {
	firebase.auth().signOut();
}
window.onbeforeunload = function() {
	if (userStorageType === "cloud") {
		saveLibraryCloud(currentUserId);
	} 
	else if (userStorageType === "local") {
		saveLibraryLocal();
	}
}
showLibraryBooks()
