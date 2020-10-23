// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
apiKey: "AIzaSyDsA1DKSm4F326blfr2JArqgIbQQJONL00",
authDomain: "top-library-5ca22.firebaseapp.com",
databaseURL: "https://top-library-5ca22.firebaseio.com",
storageBucket: "top-library-5ca22.appspot.com",
};
// Initialize Firebase
const project = firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Setup for Firebase UI Config for Authentication
const uiConfig = {
	callbacks: {
		signInSuccessWithAuthResult: function(authResult, redirectUrl) {
			return true
		},
		uiShown: function() {
			document.getElementById('loader').style.display = 'none'
		}
	},
	signInFlow: 'popup',
	signInSuccessUrl: 'https://angeladlr-library.netlify.app',
	signInOptions: [
		{
			provider: firebase.auth.GoogleAuthProvider.PROVIDER_ID,
			scopes: [
				'profile',
				'email',
				'openid'
			],
			customParameters: {
				prompt: 'select_account'
			}
		}
	]
}
const ui = new firebaseui.auth.AuthUI(firebase.auth());

