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

/**     Combo Boxes         **/
let signalsComboBox = document.getElementById('current-components')


/**      Input Fields       **/
let frequencyInputField = document.getElementById('frequency'),
    amplitudeInputField = document.getElementById('amplitude'),
    typeInputField = document.getElementById('type'),
    samplingRateInputField = document.getElementById('sample'),
    noiseInputSlider = document.getElementById('myRange')

/**    Tables     **/
let signalsTable = document.getElementById('signals')

/**    Text     **/
let snrValueText = document.getElementById('snr-value-text')

/**************************************************************************************
 *                                    Helper Functions
 **************************************************************************************/

async function generateSignal(freq, amp, type, sampFreq) {

    // generate signal
    signal.addSignals(amp, freq, type);

     /**  if the sampling frequency is more than the current sampling frequency
      *   then consider it, else it will take the old sampling frequency
      *   (getting the max of the sampling frequencies)
      * **/
    if (sampFreq > signal.samplingFrequency) {
        signal.samplingFrequency = sampFreq
    }

    /**   create an HTML table element(row) and append it to the table   **/
    // get signal count
    let signalCount = signal.signalsCount

    // create the element
    let item = document.createElement('tr');

    // set the id of the row
    item.setAttribute('id', `Signal${signalCount}`);
    item.innerHTML = `
                    <td>Signal ${signalCount}</td>
                    <td>${freq} Hz</td>
                    <td>${amp}</td>
                    <td>${type}</td>
    `
    // append the row to the table
    signalsTable.appendChild(item)

    /**   create an HTML combo box element(option) and append it to the combo box   **/

    // create the element
    let option = document.createElement("option");
    option.text = ` (Signal${signalCount}) \t Frequency= ${freq}, Amplitude= ${amp}`
    option.value = `Signal${signalCount}`

    // append the option to the combo box
    signalsComboBox.appendChild(option);

    /**   decide which data to plot based on the SNR ratio selected  **/

    if (noiseInputSlider.value < 100) {
        signal.addNoise(noiseInputSlider.value);
        signal.motionPlot("canvas-1", signal.noiseData);
        await signal.motionPlot("canvas-1", signal.noiseData);
        signal.sampleSignal(signal.samplingFrequency, signal.noiseData);
    } else {
        signal.motionPlot("canvas-1", signal.data);         // plot signal
        await signal.motionPlot("canvas-1", signal.data);   // animate plot
        signal.sampleSignal(signal.samplingFrequency);                             // sample the signal
    }
    // update the plot
    signal.updateCanvas();

    // set the sampling input field value to the current max sampling frequency
    samplingRateInputField.value = signal.samplingFrequency
}

function resetSignalValues() {

    /** - setting all values to zero
     *  - deleting data from signal data arrays
     *  - return the input field value of sampling frequency to nothing
     * **/
    signal.samplingFrequency = 0;
    signal.freq = 0;
    signal.amp = 0
    this.data = [
        {
            x: [],
            y: [],
            mode: "lines",
            type: "scatter",
            name: 'Signal'
        }
    ];
    this.noiseData = [{
        x: [],
        y: [],
        mode: "lines",
        type: "scatter"
    }]

    this.sampledData = [{
        x: [],
        y: [],
        mode: "lines",
        type: "markers",
        line: {
            color: '#004072'
        }
    }]

    /**   Reconstructed Signal Data Configurations  */
    this.reconstructedData = [{
        x: [],
        y: [],
        mode: "lines",
        type: "scatter",
        line: {
            color: '#ff3c00'
        }
    }]
    samplingRateInputField.value = ''
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

    myCSVObject = signal.exportSignalToCSV(signal.reconstructedData[0].x, signal.reconstructedData[0].y)
    // }
    let csv = 'x,y\n';

    myCSVObject.forEach(function (row) {
        csv += row.join(',');
        csv += "\n";
    });

    // make the redirection to the download api
    redirect.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
    redirect.download = `Signal${signal.signalsCount}`;
}

// Remove Signal Button
removeSignalBtn.onclick = async () => {

    // if there is no signal don't do anything
    if (signal.signalsCount === 0)
        return;

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

    /**  if this is the last signal (signal count = 0) then we have to clear the plot
     *  if not we see the SNR, if its less than 100 we plot the noise data
     *  else we plot the normal data
     * **/

    if (signal.signalsCount === 0) {
        let data = [
            {
                x: [0],
                y: [0]
            }
        ];
        await signal.motionPlot("canvas-1", data);
        Plotly.react(
            "canvas-1",
            [
                {
                    x: [0],
                    y: [0]
                }
            ],
            {
                font: {
                    size: 12
                }
            },
            signal.config
        );

        /** reset values of the signal object **/
        resetSignalValues()

    } else if (noiseInputSlider.value < 100) {
        signal.addNoise(noiseInputSlider.value);
        signal.motionPlot("canvas-1", signal.noiseData);
        await signal.motionPlot("canvas-1", signal.noiseData);
        signal.sampleSignal(sampFreq, signal.noiseData);
        signal.updateCanvas();

    } else {
        signal.motionPlot("canvas-1", signal.data);
        await signal.motionPlot("canvas-1", signal.data);
        signal.sampleSignal(sampFreq);
        signal.updateCanvas();
    }
    // remove the signal from the combo box
    signalsComboBox.remove(signalsComboBox.selectedIndex)
}


// Random Signal Button
randomSignal.onclick = async function () {

    /**  generate random values for:
     *   frequency (1~5)
     *   amplitude (1-10)
     *   type => sin by default
     *   sampling frequency = 2 x the max frequency
     * **/
    let randFreq = Math.floor(Math.random() * (5 - 1) + 1),
        randAmp = Math.floor(Math.random() * (10 - 1) + 1),
        randType = 'sin',
        randSampFreq = 2 * randFreq;

    // generate the signal
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
        signal.updateCanvas()

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

    // get the sampling frequency input
    let samplingRate = samplingRateInputField.value;
    // check if it's not zero
    if (signal.signalsCount !== 0) {
        // noise applied
        if (noiseInputSlider.value < 100) {
            // sample signal with noise data
            signal.sampleSignal(samplingRate, signal.noiseData);
        } else {
            // sample the normal data
            signal.sampleSignal(samplingRate);
        }

        // replot the canvas
        signal.updateCanvas();
    }
};

// noise slider change
noiseInputSlider.onmouseup = function () {
    // get sampling frequency from the inout field
    let sampFreq = samplingRateInputField.value;

    // if the sampling frequency is empty set it to the signal sampling frequency
    if (sampFreq === '')
        sampFreq = signal.samplingFrequency

    // set the signal SNR to the value coming from the slider
    signal.addNoise(noiseInputSlider.value);

    // plot the noise
    // sample the new signal
    signal.sampleSignal(sampFreq, signal.noiseData);
    signal.updateCanvas();
};

// noise slider view the change value
noiseInputSlider.onchange = function () {
    snrValueText.innerHTML = noiseInputSlider.value;
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
        font: {
            size: 12
        }
    },
    signal.config)
;