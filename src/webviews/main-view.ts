import {
    provideVSCodeDesignSystem,
    vsCodeButton,
    vsCodeTextArea,
    vsCodeDivider,
    vsCodeProgressRing,
    vsCodeTextField,
    ProgressRing,
    Button,
    TextArea,
} from "@vscode/webview-ui-toolkit";
import { log } from "node:console";
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
/**
 * Register "@vscode/webview-ui-toolkit" component to vscode design system.
 */
provideVSCodeDesignSystem().register(vsCodeButton(), vsCodeProgressRing(), vsCodeTextArea(), vsCodeDivider(), vsCodeProgressRing(), vsCodeTextField());

const vscode = acquireVsCodeApi();

// Add load event listener.
window.addEventListener("load", main);

// declare an array for search history.
let searchHistory: string[] = [];

vscode.postMessage({
    command: "history-request",
});

// Declare Html elements
const answer = document.getElementById("answers-id") as HTMLElement;
const chatQuestionTextArea = document.getElementById("question-text-id") as TextArea;
const askButton = document.getElementById("ask-button-id") as Button;
const clearButton = document.getElementById("clear-button-id") as Button;
const clearHistoryButton = document.getElementById("clear-history-button");

// image
const askImageButton = document.getElementById("ask-image-button-id") as Button;
const promptTextArea = document.getElementById("prompt-text-id") as TextArea;
const clearImageButton = document.getElementById("clear-image-button-id") as Button;

/**
 * Main function
 */
function main() {

    hideProgressRing();

    // Add the eventLsteners.
    askButton?.addEventListener("click", handleAskClick);
    clearButton?.addEventListener("click", handleClearClick);
    clearHistoryButton?.addEventListener("click", handleClearHistoryButtonClick);

    // image button events
    askImageButton?.addEventListener("click", handleImageAskClick);
    clearImageButton?.addEventListener("click", handleImageClearClick);

    // chat enter event
    chatQuestionTextArea?.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            // Trigger the button element with a click
            handleAskClick();
        }
    });

    // image enter event
    promptTextArea?.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            // Trigger the button element with a click
            handleImageAskClick();
        }
    });

    try {
        // Handle messages sent from the extension to the webview
        window.addEventListener('message', event => {
            const message = event.data; // The json data that the extension sent
            switch (message.command) {
                case 'answer':
                    // Append answer.
                    const data = document.createTextNode(message.data);
                    answer?.appendChild(data);
                    break;
                case 'history-data':
                    searchHistory = message.data;
                    // updateHistoryList();
                    break;
                case 'image-urls-answer':
                    // Append answer.
                    const imageList = message.data as any[];
                    updateImageList(imageList)
                    hideProgressRing();
                    break;
                case 'image-error-answer':
                    // Append answer.
                    showErrorMessage(message.data);
                    hideProgressRing();
                    break;
                case 'error':
                    break;
            }
        });
    } catch (err: any) {
        console.log('errrr js');
        console.log(err);
    }
}

//#region Chat

/**
 * Handle ask button click event.
 */
function handleAskClick() {

    // Send messages to Panel.
    vscode.postMessage({
        command: "press-ask-button",
        data: chatQuestionTextArea.value,
    });

    // Clear answer filed.
    answer.innerHTML = '';

    // addHistory(chatQuestionTextArea.value);
    updateHistoryList();
}

/**
 * Handle clear button click event.
 */
function handleClearClick() {
    // Clear answer field.
    answer.innerHTML = '';

    // Clear question field.
    chatQuestionTextArea.value = '';
}

/**
 * Handle clear button click event.
 */
function handleClearHistoryButtonClick() {
    searchHistory = [];

    // Send messages to Panel.
    vscode.postMessage({
        command: "clear-history",
    });

    // updateHistoryList()

    const div = document.getElementById('history-id');
    if (div != null) {
        div.textContent = '';
        const p = document.createElement('p');
        p.textContent = '';
        div.appendChild(p);
    }
}

/**
 * Update history list.
 */
async function updateHistoryList() {
    hljs.registerLanguage('javascript', javascript);
    const response: any = {
        textContent: "\n\nDon't forget to add this permission to the manifest file:\n\n    <uses-permission android:name=\"android.permission.ACCESS_FINE_LOCATION\" />\n\n\nThe code for the java class needs to be something similar to the following:\n\npublic class MainActivity extends Activity implements ConnectionCallbacks,\n    OnConnectionFailedListener, LocationListener {\n\n// LogCat tag\nprivate static final String TAG = MainActivity.class.getSimpleName();\n\nprivate final static int PLAY_SERVICES_RESOLUTION_REQUEST = 1000;\n\nprivate Location mLastLocation;\n\n// Google client to interact with Google API\nprivate GoogleApiClient mGoogleApiClient;\n\n// boolean flag to toggle periodic location updates\nprivate boolean mRequestingLocationUpdates = false;\n\nprivate LocationRequest mLocationRequest;\n\n// Location updates intervals in sec\nprivate static int UPDATE_INTERVAL = 10000; // 10 sec\nprivate static int FATEST_INTERVAL = 5000; // 5 sec\nprivate static int DISPLACEMENT = 10; // 10 meters\n\n// UI elements\nprivate TextView lblLocation;\nprivate Button btnShowLocation, btnStartLocationUpdates;\n\n@Override\nprotected void onCreate(Bundle savedInstanceState) {\n    super.onCreate(savedInstanceState);\n    setContentView(R.layout.activity_main);\n\n    lblLocation = (TextView) findViewById(R.id.lblLocation);\n    btnShowLocation = (Button) findViewById(R.id.btnShowLocation);\n    btnStartLocationUpdates = (Button) findViewById(R.id.btnLocationUpdates);\n\n    // First we need to check availability of play services\n    if (checkPlayServices()) {\n\n        // Building the GoogleApi client\n        buildGoogleApiClient();\n\n        createLocationRequest();\n    }\n\n    // Show location button click listener\n    btnShowLocation.setOnClickListener(new View.OnClickListener() {\n\n        @Override\n        public void onClick(View v) {\n            displayLocation();\n        }\n    });\n\n    // Toggling the periodic location updates\n    btnStartLocationUpdates.setOnClickListener(new View.OnClickListener() {\n\n        @Override\n        public void onClick(View v) {\n            togglePeriodicLocationUpdates();\n        }\n    });\n\n}\n\n@Override\nprotected void onStart() {\n    super.onStart();\n    if (mGoogleApiClient != null) {\n        mGoogleApiClient.connect();\n    }\n}\n\n@Override\nprotected void onResume() {\n    super.onResume();\n\n    checkPlayServices();\n\n    // Resuming the periodic location updates\n    if (mGoogleApiClient.isConnected() && mRequestingLocationUpdates) {\n        startLocationUpdates();\n    }\n}\n\n@Override\nprotected void onStop() {\n    super.onStop();\n    if (mGoogleApiClient.isConnected()) {\n        mGoogleApiClient.disconnect();\n    }\n}\n\n@Override\nprotected void onPause() {\n    super.onPause();\n    stopLocationUpdates();\n}\n\n/**\n * Method to display the location on UI\n * */\nprivate void displayLocation() {\n\n    mLastLocation = LocationServices.FusedLocationApi\n            .getLastLocation(mGoogleApiClient);\n\n    if (mLastLocation != null) {\n        double latitude = mLastLocation.getLatitude();\n        double longitude = mLastLocation.getLongitude();\n\n        lblLocation.setText(latitude + \", \" + longitude);\n\n    } else {\n\n        lblLocation\n                .setText(\"(Couldn't get the location. Make sure location is enabled on the device)\");\n    }\n}\n\n/**\n * Method to toggle periodic location updates\n * */\nprivate void togglePeriodicLocationUpdates() {\n    if (!mRequestingLocationUpdates) {\n        // Changing the button text\n        btnStartLocationUpdates\n                .setText(getString(R.string.btn_stop_location_updates));\n\n        mRequestingLocationUpdates = true;\n\n        // Starting the location updates\n        startLocationUpdates();\n\n        Log.d(TAG, \"Periodic location updates started!\");\n\n    } else {\n        // Changing the button text\n        btnStartLocationUpdates\n                .setText(getString(R.string.btn_start_location_updates));\n\n        mRequestingLocationUpdates = false;\n\n        // Stopping the location updates\n        stopLocationUpdates();\n\n        Log.d(TAG, \"Periodic location updates stopped!\");\n    }\n}\n\n/**\n * Creating google api client object\n * */\nprotected synchronized void buildGoogleApiClient() {\n    mGoogleApiClient = new GoogleApiClient.Builder(this)\n            .addConnectionCallbacks(this)\n            .addOnConnectionFailedListener(this)\n            .addApi(LocationServices.API).build();\n}\n\n/**\n * Creating location request object\n * */\nprotected void createLocationRequest() {\n    mLocationRequest = new LocationRequest();\n    mLocationRequest.setInterval(UPDATE_INTERVAL);\n    mLocationRequest.setFastestInterval(FATEST_INTERVAL);\n    mLocationRequest.setPriority(LocationRequest.PRIORITY_HIGH_ACCURACY);\n    mLocationRequest.setSmallestDisplacement(DISPLACEMENT);\n}\n\n/**\n * Method to verify google play services on the device\n * */\nprivate boolean checkPlayServices() {\n    int resultCode = GooglePlayServicesUtil\n            .isGooglePlayServicesAvailable(this);\n    if (resultCode != ConnectionResult.SUCCESS) {\n        if (GooglePlayServicesUtil.isUserRecoverableError(resultCode)) {\n            GooglePlayServicesUtil.getErrorDialog(resultCode, this,\n                    PLAY_SERVICES_RESOLUTION_REQUEST).show();\n        } else {\n            Toast.makeText(getApplicationContext(),\n                    \"This device is not supported.\", Toast.LENGTH_LONG)\n                    .show();\n            finish();\n        }\n        return false;\n    }\n    return true;\n}\n\n/**\n * Starting the location updates\n * */\nprotected void startLocationUpdates() {\n\n    LocationServices.FusedLocationApi.requestLocationUpdates(\n            mGoogleApiClient, mLocationRequest, this);\n\n}\n\n/**\n * Stopping location updates\n */\nprotected void stopLocationUpdates() {\n    LocationServices.FusedLocationApi.removeLocationUpdates(\n            mGoogleApiClient, this);\n}\n\n/**\n * Google api callback methods\n */\n@Override\npublic void onConnectionFailed(ConnectionResult result) {\n    Log.i(TAG, \"Connection failed: ConnectionResult.getErrorCode() = \"\n            + result.getErrorCode());\n}\n\n@Override\npublic void onConnected(Bundle arg0) {\n\n    // Once connected with google api, get the location\n    displayLocation();\n\n    if (mRequestingLocationUpdates) {\n        startLocationUpdates();\n    }\n}\n\n@Override\npublic void onConnectionSuspended(int arg0) {\n    mGoogleApiClient.connect();\n}\n\n@Override\npublic void onLocationChanged(Location location) {\n    // Assign the new location\n    mLastLocation = location;\n\n    Toast.makeText(getApplicationContext(), \"Location changed!\",\n            Toast.LENGTH_SHORT).show();\n\n    // Displaying the new location on UI\n    displayLocation();\n}\n\n    \n    \n        \n            \n            \n                \n\n\n\n\n    \n\n        \n            Share\n        \n\n\n                    \n                        Improve this answer\n                    \n\n                \n                    \n                        Follow\n                        \n                    \n                \n\n\n\n\n\n\n    \n    \n\n            \n\n\n            \n                \n    \n        \n            answered Dec 4, 2015 at 13:04\n        \n        \n    \n    \n        \n    \n    \n        Michele La FerlaMichele La Ferla\n        \n            6,8551111 gold badges5555 silver badges8282 bronze badges\n        \n    \n\n\n\n            \n        \n        \n    \n    \n    \n\n\n\n\n\n            1 \n    \n        \n            \n\n                        \n        \n            \n            \n        \n        \n            \n                \n                can you please accept and upvote my answer if it has helped you?\n                \n                \n– Michele La Ferla\n                \n                Dec 15, 2015 at 9:05\n            \n        \n    \n\n            \n\t    \n\n        \n                    Add a comment\n                 | \n            \n                 \n    \n    \n"
    }
    showProgressRing()
    const div = document.getElementById('history-id');

    const res = await fetch('https://dummyjson.com/products');
    const json = await res.json();
    console.log(JSON.stringify(json.products));
    // txt = JSON.stringify(json.products);
    if (div != null) {
        div.textContent = '';
        const p = document.createElement('div');
        p.className = "code";
        p.style.cssText = 'white-space: pre;';
        p.textContent = response.textContent;
        div.appendChild(p);
        hideProgressRing();
        setTimeout(() => {
            document.querySelectorAll('.code').forEach((el: any) => {
                el.className = "language-javascript";
                // then highlight each
                hljs.highlightElement(el);
            });
            const answer_el: any = document.getElementById('answers-id');
            if (answer_el)
                answer_el.style.display = "none";
        }, 0)

        // let txt = JSON.stringify(json.products);
        // typeWriter();
        // hideProgressRing();
    }

    // if (ul != null) {
    //     ul.textContent = '';
    //     let index = 0;
    //     for (const content of searchHistory) {
    //         if (content != undefined) {

    //             index++;
    //             const spanContainer = document.createElement('span');
    //             spanContainer.id = "container-span-id"
    //             spanContainer.className = "flex-container"
    //             spanContainer.style.marginTop = '15px';

    //             const spanNumber = document.createElement('span');
    //             spanNumber.id = "span-number-id"
    //             spanNumber.textContent = index + ') ';
    //             spanNumber.style.minWidth = '10px';
    //             spanNumber.style.width = '10px';
    //             spanNumber.style.fontSize = '14px';
    //             spanContainer.appendChild(spanNumber);

    //             const li = document.createElement('li');
    //             li.textContent = content.length > 50 ? content.substring(0, 250) + '...' : content;
    //             li.addEventListener('click', () => {
    //                 onHistoryClicked(content);
    //             });
    //             li.title = content;
    //             li.style.cursor = 'pointer';
    //             li.style.fontSize = '14px';
    //             li.style.listStyleType = 'none';

    //             spanContainer.appendChild(li);
    //             ul.appendChild(spanContainer);
    //         }
    //     }
    // }
}

// let txt = '';
// let i = 0;
// let speed = 1;
// function typeWriter() {
//     const div: any = document.getElementById('history-id');
//     if (i < txt.length) {
//         div.innerHTML += txt.charAt(i);
//         // window.scrollTo(0, document.body.scrollHeight);
//         i++;
//         setTimeout(typeWriter, speed);

//         // div.textContent = '';
//         // const p = document.createElement('p');
//         // p.textContent = JSON.stringify(json.products);
//         // div.appendChild(p);
//         // hideProgressRing();
//     }
// }

/**
 * Handle on click history question event.
 */
function onHistoryClicked(question: string) {
    vscode.postMessage({ command: 'history-question-clicked', data: question });

    // clear fields
    answer.innerHTML = '';
    chatQuestionTextArea.value = question;
}

/**
 * Add last search to history.
 * @param content :string
 */
function addHistory(content: string) {
    if (content != undefined) {
        if (searchHistory.length < 10) {
            if (!searchHistory.includes(content))
                searchHistory.unshift(content);
        }
        if (searchHistory.length == 10) {
            searchHistory.pop();
            if (!searchHistory.includes(content)) {
                searchHistory.unshift(content);
            }
        }
    }
    updateHistoryList();
}

//#endregion Chat

//#region Image

/**
 * Update history list.
 */
function updateImageList(imageUrls: any[]) {

    const galleryContainer = document.getElementById('gallery-container');

    if (galleryContainer != null) {
        galleryContainer.textContent = '';
        let index = 0;
        for (const img of imageUrls) {
            if (img != undefined) {

                index++;

                const galleryDivTag = document.createElement('div');
                galleryDivTag.className = "gallery"

                const aTag = document.createElement('a');
                aTag.target = '_blank';
                aTag.href = img.url;

                const imgNode = document.createElement('img');
                imgNode.src = img.url;
                imgNode.width = 400;
                imgNode.height = 400;
                imgNode.alt = promptTextArea.value + '-' + index;
                imgNode.style.cursor = 'pointer';
                aTag.appendChild(imgNode);

                const descDivTag = document.createElement('div');
                descDivTag.className = "desc";
                descDivTag.textContent = promptTextArea.value + '-' + index;

                galleryDivTag.appendChild(aTag);
                galleryDivTag.appendChild(descDivTag);
                galleryContainer.appendChild(galleryDivTag);
            }
        }
    }
}


/**
 * Handle generate image button click event.
 */
function handleImageAskClick() {

    showProgressRing();

    const pError = document.getElementById('image-error-id') as any;
    pError.textContent = '';

    // Send messages to Panel.
    vscode.postMessage({
        command: "press-image-ask-button",
        data: promptTextArea.value,
    });

    // Clear images filed.
    updateImageList([]);
}

/**
 * Handle clear image button click event.
 */
function handleImageClearClick() {

    // Clear images filed.
    updateImageList([]);

    // Clear question field.
    promptTextArea.value = '';

}


function showErrorMessage(message: string) {
    const pError = document.getElementById('image-error-id') as any;
    pError.textContent = message;
}

//#endregion Image

/**
 * Show progessing ring.
 */
function showProgressRing() {
    // add progress ring.
    const progressRing = document.getElementById("progress-ring-id") as ProgressRing;
    progressRing.style.display = 'inline-block';
}

/**
 * Hide progressing ring.
 */
function hideProgressRing() {
    const progressRing = document.getElementById("progress-ring-id") as ProgressRing;
    progressRing.style.display = 'none';
}
