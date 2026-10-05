import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";

import {
    getDatabase,
    ref,
    onValue,
    set
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-database.js";


// =====================================================
// FIREBASE CONFIGURATION
// =====================================================

const firebaseConfig = {
    apiKey: "AIzaSyCLcdloHEMtEr8lnamkLXIrH6Nx5av5dhI",
    authDomain: "moretechmorerohome.firebaseapp.com",
    databaseURL: "https://moretechmorerohome-default-rtdb.firebaseio.com",
    projectId: "moretechmorerohome",
    storageBucket: "moretechmorerohome.firebasestorage.app",
    messagingSenderId: "660303390851",
    appId: "1:660303390851:web:b201c0656ce12e5f2b13b6"
};


// =====================================================
// INITIALIZE FIREBASE
// =====================================================

const app =
    initializeApp(
        firebaseConfig
    );


const database =
    getDatabase(app);


// =====================================================
// DEVICE REFERENCE
// =====================================================

const deviceRef =
    ref(
        database,
        "Mortech/Home/Device"
    );


// =====================================================
// UI REFERENCES
// =====================================================

const deviceNameElement =
    document.getElementById("deviceName");

const onlineElement =
    document.getElementById("onlineStatus");

const heartbeatElement =
    document.getElementById("heartbeat");

const waterPercentageElement =
    document.getElementById("waterPercentage");

const waterDistanceElement =
    document.getElementById("waterDistance");

const waterFillElement =
    document.getElementById("waterFill");

const motionElement =
    document.getElementById("motionStatus");

const motionIndicator =
    document.getElementById("motionIndicator");

const relayStatusElement =
    document.getElementById("relayStatus");

const relayIndicator =
    document.getElementById("relayIndicator");

const relayOnButton =
    document.getElementById("relayOn");

const relayOffButton =
    document.getElementById("relayOff");


// =====================================================
// COLORS
// =====================================================

const GREEN = "#22C55E";
const RED = "#E53935";
const AMBER = "#F59E0B";
const GREY = "#777B85";


// =====================================================
// UPDATE ONLINE STATUS
// =====================================================

function updateOnlineStatus(online) {

    onlineElement.textContent =
        online
            ? "ONLINE"
            : "OFFLINE";


    const connection =
        onlineElement.parentElement;


    if (online) {

        connection.style.background =
            "#183023";

        connection.style.color =
            GREEN;

    } else {

        connection.style.background =
            "#301D1F";

        connection.style.color =
            RED;

    }

}


// =====================================================
// UPDATE WATER
// =====================================================

function updateWater(percentage) {

    if (percentage === undefined ||
        percentage === null ||
        isNaN(Number(percentage))) {

        waterPercentageElement.textContent =
            "--";

        waterFillElement.style.width =
            "0%";

        return;
    }


    const level =
        Math.max(
            0,
            Math.min(
                100,
                Number(percentage)
            )
        );


    waterPercentageElement.textContent =
        level.toFixed(1);


    waterFillElement.style.width =
        level + "%";


    // ================================================
    // WATER LEVEL VISUAL STATE
    // ================================================

    if (level < 20) {

        waterFillElement.style.background =
            RED;

    } else if (level < 40) {

        waterFillElement.style.background =
            AMBER;

    } else {

        waterFillElement.style.background =
            "#4CB4F5";

    }

}


// =====================================================
// UPDATE MOTION
// =====================================================

function updateMotion(motion) {

    if (motion) {

        motionElement.textContent =
            "MOTION DETECTED";

        motionElement.style.color =
            AMBER;

        motionIndicator.style.background =
            AMBER;

        motionIndicator.style.boxShadow =
            "0 0 12px " + AMBER;

    } else {

        motionElement.textContent =
            "CLEAR";

        motionElement.style.color =
            GREEN;

        motionIndicator.style.background =
            GREEN;

        motionIndicator.style.boxShadow =
            "0 0 10px " + GREEN;

    }

}


// =====================================================
// UPDATE RELAY
// =====================================================

function updateRelay(relay) {

    if (relay) {

        relayStatusElement.textContent =
            "ON";

        relayStatusElement.style.color =
            RED;

        relayIndicator.style.background =
            RED;

        relayIndicator.style.boxShadow =
            "0 0 12px " + RED;


        relayOnButton.style.opacity =
            "1";

        relayOffButton.style.opacity =
            "0.55";

    } else {

        relayStatusElement.textContent =
            "OFF";

        relayStatusElement.style.color =
            GREY;

        relayIndicator.style.background =
            GREY;

        relayIndicator.style.boxShadow =
            "none";


        relayOnButton.style.opacity =
            "0.55";

        relayOffButton.style.opacity =
            "1";

    }

}


// =====================================================
// REALTIME DEVICE LISTENER
// =====================================================

onValue(
    deviceRef,
    (snapshot) => {

        const data =
            snapshot.val();


        if (!data) {

            console.log(
                "No device data."
            );

            deviceNameElement.textContent =
                "No device";

            updateOnlineStatus(false);

            return;
        }


        // =================================================
        // DEVICE NAME
        // =================================================

        deviceNameElement.textContent =
            data.name ||
            "Unknown";


        // =================================================
        // ONLINE
        // =================================================

        const online =
            data.online === true;


        updateOnlineStatus(
            online
        );


        // =================================================
        // HEARTBEAT
        // =================================================

        heartbeatElement.textContent =
            data.lastHeartbeat ||
            "--";


        // =================================================
        // SENSOR DATA
        // =================================================

        const sensors =
            data.Sensors ||
            {};


        const waterDistance =
            sensors.waterDistance;


        const waterPercentage =
            sensors.waterPercentage;


        const motion =
            sensors.motion;


        // =================================================
        // WATER DISTANCE
        // =================================================

        waterDistanceElement.textContent =
            waterDistance !== undefined
                ? Number(
                    waterDistance
                ).toFixed(1)
                : "--";


        // =================================================
        // WATER PERCENTAGE
        // =================================================

        updateWater(
            waterPercentage
        );


        // =================================================
        // MOTION
        // =================================================

        updateMotion(
            motion === true
        );


        // =================================================
        // ACTUAL RELAY STATE
        // =================================================

        const state =
            data.State ||
            {};


        const relay =
            state.relay === true;


        updateRelay(
            relay
        );

    },

    (error) => {

        console.error(
            "Firebase listener error:",
            error
        );

        deviceNameElement.textContent =
            "Connection error";

        updateOnlineStatus(
            false
        );

    }
);


// =====================================================
// SEND RELAY COMMAND
// =====================================================

window.setRelay =
    function(state) {

        const relayRef =
            ref(
                database,
                "Mortech/Home/Device/Command/relay"
            );


        // =============================================
        // TEMPORARY BUTTON FEEDBACK
        // =============================================

        relayOnButton.disabled =
            true;

        relayOffButton.disabled =
            true;


        set(
            relayRef,
            state
        )

        .then(
            () => {

                console.log(
                    "Relay command sent:",
                    state
                );

            }
        )

        .catch(
            (error) => {

                console.error(
                    "Relay command failed:",
                    error
                );

                alert(
                    "Unable to send relay command."
                );

            }
        )

        .finally(
            () => {

                relayOnButton.disabled =
                    false;

                relayOffButton.disabled =
                    false;

            }
        );

    };

