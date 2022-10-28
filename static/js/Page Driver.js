/**************************************************************************************
 *                                  Upper Bar Handler
 **************************************************************************************/

let homeTab = document.getElementById('home-tab'),
    reconstructionTab = document.getElementById('reconstruction-tab'),
    homeBody = document.getElementById('home-body'),
    reconstructionBody = document.getElementById('reconstruction-body')

/**
 * Toggle the bars when clicked
 * **/

homeTab.onclick = function () {
    if (!homeBody.classList.contains('active') && !homeTab.classList.contains('active')) {

        // remove class active from the tab and div of reconstruction tab
        reconstructionBody.classList.remove('active')
        reconstructionTab.classList.remove('active')

        // add class active from the tab and div of Home tab
        homeBody.classList.add('active')
        homeTab.classList.add('active')
    }
}

reconstructionTab.onclick = function () {
    if (!reconstructionBody.classList.contains('active') && !reconstructionTab.classList.contains('active')) {

        // remove class active from the tab and div of Home tab
        homeBody.classList.remove('active')
        homeTab.classList.remove('active')


        // add class active for the tab and div of reconstruction Tab
        reconstructionBody.classList.add('active')
        reconstructionTab.classList.add('active')
    }

}

/**************************************************************************************
 *                                  Variables Definition
 **************************************************************************************/

let signal = new GenerateSignal()

/**      Buttons      **/
let generateBtn = document.getElementById('add'),
    uploadBtn = document.getElementById('selectedFile'),
    saveBtn = document.getElementById('save'),
    removeSignalBtn = document.getElementById('remove-signal'),
    redirect = document.getElementById('download-redirect'),
    randomSignal = document.getElementById('generate-random')

/**     Combo Boxes  **/
let signalsComboBox = document.getElementById('current-components')


/**      Input Fields       **/
let frequencyInputField = document.getElementById('frequency'),
    amplitudeInputField = document.getElementById('amplitude'),
    typeInputField = document.getElementById('type'),
    samplingRateInputField = document.getElementById('sample'),
    noiseInputField = document.getElementById('myRange')

/**    Tables     **/
let signalsTable = document.getElementById('signals')

/**    Text     **/
let snrValueText = document.getElementById('snr-value-text')

/**************************************************************************************
 *                                    Helper Functions
 **************************************************************************************/

async function generateSignal(freq, amp, type, sampFreq) {

    // generate signal
    signal.addSignals(amp, freq, type, sampFreq);
    signal.samplingFrequency = sampFreq

    let signalCount = signal.signalsCount
    let item = document.createElement('tr');
    item.setAttribute('id', `Signal${signalCount}`);
    item.innerHTML = `
                    <td>Signal ${signalCount}</td>
                    <td>${freq} Hz</td>
                    <td>${amp}</td>
                    <td>${type}</td>
    `
    signalsTable.appendChild(item)

    let option = document.createElement("option");
    option.text = ` (Signal${signalCount}) \t Frequency= ${freq}, Amplitude= ${amp}`
    option.value = `Signal${signalCount}`
    signalsComboBox.appendChild(option);

    if (noiseInputField.value < 100) {
        signal.addNoise(noiseInputField.value);
        signal.motionPlot("canvas-1", signal.noiseData);
        await signal.motionPlot("canvas-1", signal.noiseData);
        signal.sampleSignal(sampFreq, signal.noiseData);
    } else {
        signal.motionPlot("canvas-1", signal.data);         // plot signal
        await signal.motionPlot("canvas-1", signal.data);   // animate plot
        signal.sampleSignal(sampFreq);                             // sample the signal
    }

    signal.updateCanvas2(sampFreq);             // update down plot
}


/**************************************************************************************
 *                             Event Handlers (On Button Click)
 **************************************************************************************/


// Generate Signal Button
generateBtn.onclick = async function () {

    /**   if the user hasn't written any input >> show invalid modal card  **/
    if (frequencyInputField.value === '' || amplitudeInputField.value === '') {
        Swal.fire({
            title: 'Invalid Input',
            text: "Please fill the signal data",
            icon: 'error',
            confirmButtonColor: '#004072',
        })
    }
    /**   if user write valid input >> procced  **/
    else {
        let type = typeInputField.value
        let sampFreq = samplingRateInputField.value

        // default value for sin Type
        if (type === '' || type !== 'sin' || type !== 'cos')
            type = 'sin'

        // default value for sampling frequency
        if (sampFreq === '')
            sampFreq = 2 * frequencyInputField.value

        await generateSignal(frequencyInputField.value, amplitudeInputField.value, type, sampFreq)
    }

};

// Save Signal Button
saveBtn.onclick = () => {
    let myCSVObject = []
    // if (noiseInputField.value < 100) {
    //     myCSVObject = signal.exportSignalToCSV(signal.noiseData[0].x, signal.noiseData[0].y)
    // } else {
        myCSVObject = signal.exportSignalToCSV(signal.reconstructedData[0].x, signal.reconstructedData[0].y)
    // }
    let csv = 'x,y\n';

    myCSVObject.forEach(function (row) {
        csv += row.join(',');
        csv += "\n";
    });
    redirect.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
    redirect.download = `Signal${signal.signalsCount}`;
}

// Remove Signal Button
removeSignalBtn.onclick = async () => {

    // get sampling frequency from the inout field
    let sampFreq = samplingRateInputField.value;

    // if the sampling frequency is empty set it to the signal sampling frequency
    if (sampFreq === '')
        sampFreq = signal.samplingFrequency

    // delete signal from the combo box
    signal.deleteSignal(signalsComboBox.value);

    // get the signal and remove it by its ID
    let removed = document.getElementById(signalsComboBox.value)
    removed.remove()

    if (signal.signalsCount === 0) {
        let data = [
            {
                x: [0],
                y: [0]
            }
        ];
        await signal.motionPlot("canvas-1", data);
        Plotly.react(
            "canvas-2",
            [{x: [0], y: [0]}],
            {
                title: "Processed Plot",
                font: {
                    size: 12
                }
            },
            signal.config
        );

    } else if (noiseInputField.value < 100) {
        signal.addNoise(noiseInputField.value);
        signal.motionPlot("canvas-1", signal.noiseData);
        await signal.motionPlot("canvas-1", signal.noiseData);
        signal.sampleSignal(sampFreq, signal.noiseData);
        signal.updateCanvas2(sampFreq);

    } else {
        signal.motionPlot("canvas-1", signal.data);
        await signal.motionPlot("canvas-1", signal.data);
        signal.sampleSignal(sampFreq);
        signal.updateCanvas2(sampFreq);
    }
    signalsComboBox.remove(signalsComboBox.selectedIndex)
}

// Random Signal Button
randomSignal.onclick = async function () {
    let randFreq = Math.floor(Math.random() * (5 - 1) + 1),
        randAmp = Math.floor(Math.random() * (10 - 1) + 1),
        randType = 'sin',
        randSampFreq = 2 * randFreq + 1;

    await generateSignal(randFreq, randAmp, randType, randSampFreq)
}

/**************************************************************************************
 *                             Event Handlers (On Input Change)
 **************************************************************************************/

// when file is input, the state of the element is changed
uploadBtn.oninput = function (event) {
    let sampFreq = samplingRateInputField.value
    if (sampFreq === '') {
        sampFreq = 10
        samplingRateInputField.value = sampFreq
    }

    let file = event.target.files[0],
        fileReader = new FileReader();

    fileReader.readAsText(file)
    fileReader.onload = async function (ev) {
        let csv = ev.target.result,
            parsedFile = d3.csvParse(csv)
        signal.openSignalFromPC(parsedFile)

        let option = document.createElement("option");
        option.text = `(Signal${signal.signalsCount})`
        option.value = `Signal${signal.signalsCount}`
        signalsComboBox.appendChild(option)
        signal.motionPlot('canvas-1', signal.data)
        await signal.motionPlot('canvas-1', signal.data)
        signal.sampleSignal(sampFreq)
        signal.updateCanvas2(sampFreq)

        let item = document.createElement('tr');
        item.setAttribute('id', `signal-table${signal.signalsCount}`);
        item.innerHTML = `
                    <td>Signal ${signal.signalsCount}</td>
                    <td>XX Hz</td>
                    <td>XX </td>
                    <td>Imported</td>
    `
        signalsTable.appendChild(item)
    }
}

// sampling input change
samplingRateInputField.onchange = async function () {
    let samplingRate = samplingRateInputField.value;
    if (signal.signalsCount !== 0) {
        if (noiseInputField.value < 100) {
            //recalculate the signal
            signal.sampleSignal(samplingRate, signal.noiseData);
        } else {
            signal.sampleSignal(samplingRate);
        }
        signal.updateCanvas2(samplingRate);
    }
};

// noise slider change
noiseInputField.onmouseup = function () {
    // get sampling frequency from the inout field
    let sampFreq = samplingRateInputField.value;

    // if the sampling frequency is empty set it to the signal sampling frequency
    if (sampFreq === '')
        sampFreq = signal.samplingFrequency

    signal.addNoise(noiseInputField.value);
    signal.plotNoise();
    signal.sampleSignal(sampFreq, signal.noiseData);
    signal.updateCanvas2(noiseInputField.value);
};

// noise slider view the change value
noiseInputField.onchange = function () {
    snrValueText.innerHTML = noiseInputField.value;
}

/**************************************************************************************
 *                       Application Logic (App Starts Here)
 **************************************************************************************/

Plotly.newPlot(
    "canvas-1",
    [
        {
            x: [0],
            y: [0]
        }
    ],
    {
        title: "Main Plot",
        font: {
            size: 12
        }
    },
    signal.config);

Plotly.newPlot(
    "canvas-2",
    [{x: [0], y: [0]}],
    {
        title: "Processed Plot",
        font: {
            size: 12
        }
    },
    signal.config
);