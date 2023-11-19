let diff = "easy";
let wordsOrSentences = "words";
let fromSelect = "English";
let toSelect = "Japanese";
let topic = "travel";

let languageList = [
    "English",
    "French",
    "Mandarin",
    "Japanese"
]

let fromSelected = null;
let fromSelectedBtn = null;
let toSelected = null;
let toSelectedBtn = null;
let pronunciationSelected = null;
let pronunciationSelectedBtn = null;

$(document).ready(function(){

    const selectElement = document.getElementById("fromSelect");
    const selectElement2 = document.getElementById("toSelect");

    //            add function to the selectboxes
    for (let i = 0; i < languageList.length;i++) {
        let option = document.createElement("option");
        option.value = languageList[i];
        option.text = languageList[i];
        selectElement.appendChild(option);  

        let option2 = document.createElement("option");
        option2.value = languageList[i];
        option2.text = languageList[i];
        if (languageList[i] == "Japanese") {
            option2.selected = "selected";
        }
        selectElement2.appendChild(option2);  
    }

    $("#myModal").modal('show');
});

//if it is correct, disable the buttons -> have the message change
// if it's not correct, tell the user (maybe play a sound?), and unselect the current selections -> have the message change
async function checkResults(){
    let data = {fromSelected, toSelected, pronunciationSelected};
    let options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    };
    let response = await fetch('/checkResults', options);
    let json = await response.json();
    //response should contain three arrays!
    let correct = JSON.parse(json.body)['correct'];
    if (correct) {
        // flash green
        for (button of [fromSelectedBtn,toSelectedBtn,pronunciationSelectedBtn]){
            button.classList.remove("btn-primary")
            button.classList.add("btn-success")
        }

        timed = setTimeout(() => {
            for (button of [fromSelectedBtn, toSelectedBtn, pronunciationSelectedBtn]) {
                button.classList.remove("btn-success")
                button.classList.add("btn-primary")
                fromSelectedBtn.disabled = true;
                toSelectedBtn.disabled = true;
                pronunciationSelectedBtn.disabled = true;
            }
        }, 1000);
    } else {
        // flash red
        for (button of [fromSelectedBtn,toSelectedBtn,pronunciationSelectedBtn]){
            button.classList.remove("btn-primary")
            button.classList.add("btn-danger")
        }

        $("#tryagain").text("Please try again!")

        timed = setTimeout(() => {
            for (button of [fromSelectedBtn, toSelectedBtn, pronunciationSelectedBtn]) {
                button.classList.remove("btn-danger")
                button.classList.add("btn-primary")
                fromSelectedBtn.classList.remove("active");
                toSelectedBtn.classList.remove("active");
                pronunciationSelectedBtn.classList.remove("active");
            }
        }, 1000);

    }
    timed2 = setTimeout(() => {
        fromSelected = null;
        fromSelectedBtn = null;
        toSelected = null;
        toSelectedBtn = null;
        pronunciationSelected = null;
        pronunciationSelectedBtn = null;
    }, 2000);
}

// better way to do this is just to fetch and overwrite on submit!
function difficulty(difficulty) {
    diff = String(difficulty);
}

function resultSelected(btn){
    event.preventDefault();
    //            console.log(btn.classList.contains("active"))

    if (btn.classList.contains("col1")) {
        if (fromSelected != null) {
            fromSelectedBtn.classList.remove("active");
        }

        if (fromSelected == btn.innerText) {
            fromSelected = null;
            fromSelectedBtn = null;
        } else {
            fromSelected = btn.innerText;
            fromSelectedBtn = btn;
        }
    }
    else if (btn.classList.contains("col2")) {
        if (toSelected != null) {
            toSelectedBtn.classList.remove("active");
        }

        if (toSelected == btn.innerText) {
            toSelected = null;
            toSelectedBtn = null;
        } else {
            toSelected = btn.innerText;
            toSelectedBtn = btn;  
        }
    }            
    else if (btn.classList.contains("col3")) {
        if (pronunciationSelected != null) {
            pronunciationSelectedBtn.classList.remove("active");
        }

        if (pronunciationSelected == btn.innerText) {
            pronunciationSelected = null;
            pronunciationSelectedBtn = null;
        } else {
            pronunciationSelected = btn.innerText;
            pronunciationSelectedBtn = btn;
        }
    }

    //check to see if one of each is selected, if so send to check for victory condition and give a response indicating if it's correct or not!
    if(fromSelected && toSelected && pronunciationSelected){
        checkResults();
    }
}


async function submitForm() {
    // update from and to language
    let fromDropdown = document.getElementById("fromSelect");
    let fromSelectedOption = fromDropdown.options[fromDropdown.selectedIndex].text;
    let toDropdown = document.getElementById("toSelect");
    let toSelectedOption = toDropdown.options[toDropdown.selectedIndex].text;

    let topic = String(document.getElementById("topic").value);
    let data = {diff, wordsOrSentences, topic, fromSelectedOption, toSelectedOption};
    let options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    };
    let response = await fetch('/api', options);
    let json = await response.json();
    //response should contain three arrays!
    let body = JSON.parse(json.body);

    for (var i = 0; i < body['fromArr'].length; i++) {
        const template1 = document.createElement('button');
        template1.classList.add("btn", "btn-primary","m-1","col1");
        template1.setAttribute("onclick","resultSelected(this)")
        template1.setAttribute("data-bs-toggle","button")
        template1.innerHTML = body['fromArr'][i]
        $('#from').append(template1);
        const template2 = document.createElement('button');
        template2.classList.add("btn", "btn-primary","m-1","col2");
        template2.setAttribute("onclick","resultSelected(this)")
        template2.setAttribute("data-bs-toggle","button")
        template2.innerHTML = body['toArr'][i]
        $('#to').append(template2);
        const template3 = document.createElement('button');
        template3.classList.add("btn", "btn-primary","m-1","col3");
        template3.setAttribute("onclick","resultSelected(this)")
        template3.setAttribute("data-bs-toggle","button")
        template3.innerHTML = body['pronunciationArr'][i]
        $('#pronunciation').append(template3);
    }
}

function ws(type) {
    wordsOrSentences = String(type);
    console.log('this happened')
    console.log(wordsOrSentences)
}
