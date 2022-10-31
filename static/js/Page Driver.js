/**************************************************************************************
 *                                  Variables Definition
 **************************************************************************************/

let viewedSignal = new GenerateSignal()

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
    samplingRateInputField = document.getElementById('sample'),
    fMaxSamplingInputField = document.getElementById('sample-freq-max'),
    noiseInputSlider = document.getElementById('myRange')
// typeInputField = document.getElementById('type'),

/**    Tables     **/
let signalsTable = document.getElementById('signals')

/**    Text     **/
let snrValueText = document.getElementById('snr-value-text')

/**************************************************************************************
 *                                    Helper Functions
 **************************************************************************************/

async function generateSignal(freq, amp, type, sampFreq) {

    // generate signal
    viewedSignal.addSignals(amp, freq, type);
    /**  if the sampling frequency is more than the current sampling frequency
     *   then consider it, else it will take the old sampling frequency
     *   (getting the max of the sampling frequencies)
     * **/
    if (sampFreq > viewedSignal.samplingFrequency) {
        viewedSignal.samplingFrequency = sampFreq
    }

    /**   create an HTML table element(row) and append it to the table   **/
        // get signal count
    let signalCount = viewedSignal.signalsCount

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
        viewedSignal.addNoise(noiseInputSlider.value);
        viewedSignal.motionPlot("canvas-1", viewedSignal.noiseData);
        await viewedSignal.motionPlot("canvas-1", viewedSignal.noiseData);
        viewedSignal.sampleSignal(viewedSignal.samplingFrequency, viewedSignal.noiseData);
    } else {
        viewedSignal.motionPlot("canvas-1", viewedSignal.data);         // plot signal
        await viewedSignal.motionPlot("canvas-1", viewedSignal.data);   // animate plot
        viewedSignal.sampleSignal(viewedSignal.samplingFrequency);                             // sample the signal
    }
    // update the plot
    viewedSignal.updateCanvas();

    frequencyInputField.value = viewedSignal.freq
    amplitudeInputField.value = viewedSignal.amp
    // typeInputField.value = viewedSignal.type
    // set the sampling input field value to the current max sampling frequency
    samplingRateInputField.value = viewedSignal.samplingFrequency
    fMaxSamplingInputField.value = (viewedSignal.samplingFrequency / viewedSignal.freq)
    fMaxSamplingInputField.disabled = false;
}

function resetSignalValues() {

    /** - setting all values to zero
     *  - deleting data from signal data arrays
     *  - return the input field value of sampling frequency to nothing
     * **/
    viewedSignal.samplingFrequency = 0;
    viewedSignal.freq = 0;
    viewedSignal.amp = 0
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
    frequencyInputField.value = ''
    amplitudeInputField.value = ''
    // typeInputField.value = ''
    fMaxSamplingInputField.value = ''
    fMaxSamplingInputField.disabled = true
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
    /**   if user write valid input >> proceed  **/
    else {
        // let type = typeInputField.value
        let sampFreq = samplingRateInputField.value

        // console.log(type === 'cos')
        // default value for sin Type
        // if (type !== 'cos')
        //     type = 'sin'

        // default value for sampling frequency
        if (sampFreq === '')
            sampFreq = 2 * frequencyInputField.value

        await generateSignal(frequencyInputField.value, amplitudeInputField.value, 'cos', sampFreq)
    }

};

// Save Signal Button
saveBtn.onclick = () => {

    let myCSVObject = viewedSignal.exportSignalToCSV(viewedSignal.reconstructedData[0].x, viewedSignal.reconstructedData[0].y)
    let csv = 'x,y,freq,amp\n';

    myCSVObject.forEach(function (row) {
        csv += row.join(',');
        csv += "\n";
    });

    // make the redirection to the download api
    redirect.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
    redirect.download = `Signal${viewedSignal.signalsCount}`;
}

// Remove Signal Button
removeSignalBtn.onclick = async () => {

    // if there is no signal don't do anything
    if (viewedSignal.signalsCount === 0)
        return;

    // get sampling frequency from the input field
    let sampFreq = samplingRateInputField.value;

    // if the sampling frequency is empty set it to the signal sampling frequency
    if (sampFreq === '')
        sampFreq = viewedSignal.samplingFrequency


    // delete signal from the combo box
    viewedSignal.deleteSignal(signalsComboBox.value);

    // get the signal and remove it by its ID
    let removed = document.getElementById(signalsComboBox.value)
    removed.remove()

    /**  if this is the last signal (signal count = 0) then we have to clear the plot
     *  if not we see the SNR, if it's less than 100 we plot the noise data
     *  else we plot the normal data
     * **/

    if (viewedSignal.signalsCount === 0) {
        let data = [
            {
                x: [0],
                y: [0]
            }
        ];
        await viewedSignal.motionPlot("canvas-1", data);
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
            viewedSignal.config
        );

        /** remove the signal from the combo box **/
        signalsComboBox.remove(signalsComboBox.selectedIndex)

        /** reset values of the signal object **/
        resetSignalValues()
        return;

    } else if (noiseInputSlider.value < 100) {
        viewedSignal.addNoise(noiseInputSlider.value);
        viewedSignal.motionPlot("canvas-1", viewedSignal.noiseData);
        await viewedSignal.motionPlot("canvas-1", viewedSignal.noiseData);
        viewedSignal.sampleSignal(sampFreq, viewedSignal.noiseData);
        viewedSignal.updateCanvas();

    } else {
        viewedSignal.motionPlot("canvas-1", viewedSignal.data);
        await viewedSignal.motionPlot("canvas-1", viewedSignal.data);
        viewedSignal.sampleSignal(sampFreq);
        viewedSignal.updateCanvas();
    }
    // remove the signal from the combo box
    signalsComboBox.remove(signalsComboBox.selectedIndex)

    let fMax = 0,
        ampMax = 2;

    for (const sig in viewedSignal.signalsList) {
        if (viewedSignal.signalsList[sig][0].freq > fMax)
            fMax = viewedSignal.signalsList[sig][0].freq

        if (viewedSignal.signalsList[sig][0].amp > ampMax)
            ampMax = viewedSignal.signalsList[sig][0].amp
    }

    viewedSignal.freq = fMax;
    viewedSignal.amp = ampMax;

    frequencyInputField.value = fMax

}


// Random Signal Button
randomSignal.onclick = async function () {

    /**  generate random values for:
     *   frequency (1~5)
     *   amplitude (1-10)
     *   type => cos by default
     *   sampling frequency = 2 x the max frequency
     * **/
    let randFreq = Math.floor(Math.random() * (5 - 1) + 1),
        randAmp = Math.floor(Math.random() * (10 - 1) + 1),
        randType = 'cos',
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

        let [freq, amp] = viewedSignal.openSignalFromPC(parsedFile)

        let option = document.createElement("option");
        option.text = `(Signal${viewedSignal.signalsCount})`
        option.value = `Signal${viewedSignal.signalsCount}`
        signalsComboBox.appendChild(option)
        viewedSignal.motionPlot('canvas-1', viewedSignal.data)
        await viewedSignal.motionPlot('canvas-1', viewedSignal.data)
        viewedSignal.sampleSignal(sampFreq)
        viewedSignal.updateCanvas()

        let item = document.createElement('tr');
        item.setAttribute('id', `signal-table${viewedSignal.signalsCount}`);
        item.innerHTML = `
                    <td>Signal ${viewedSignal.signalsCount}</td>
                    <td>${freq} Hz</td>
                    <td>${amp}</td>
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
    if (viewedSignal.signalsCount !== 0) {
        // noise applied
        if (noiseInputSlider.value < 100) {
            // sample signal with noise data
            viewedSignal.sampleSignal(samplingRate, viewedSignal.noiseData);
        } else {
            // sample the normal data
            viewedSignal.sampleSignal(samplingRate);
        }

        fMaxSamplingInputField.value = (viewedSignal.samplingFrequency / viewedSignal.freq)

        // re plot the canvas
        viewedSignal.updateCanvas();
    }
};

fMaxSamplingInputField.onchange = async function () {
    let samplingFMaxRate = fMaxSamplingInputField.value;

    samplingFMaxRate *= viewedSignal.freq

    samplingRateInputField.value = samplingFMaxRate
    if (samplingFMaxRate === 0) {
        return;
    } else {

        if (viewedSignal.signalsCount !== 0) {
            // noise applied
            if (noiseInputSlider.value < 100) {
                // sample signal with noise data
                viewedSignal.sampleSignal(samplingFMaxRate, viewedSignal.noiseData);
            } else {
                // sample the normal data
                viewedSignal.sampleSignal(samplingFMaxRate);
            }

            // re plot the canvas
            viewedSignal.updateCanvas();
        }
    }
}

// noise slider change
noiseInputSlider.onmouseup = function () {
    // get sampling frequency from the inout field
    let sampFreq = samplingRateInputField.value;

    // if the sampling frequency is empty set it to the signal sampling frequency
    if (sampFreq === '')
        sampFreq = viewedSignal.samplingFrequency

    // set the signal SNR to the value coming from the slider
    viewedSignal.addNoise(noiseInputSlider.value);

    // plot the noise
    // sample the new signal
    viewedSignal.sampleSignal(sampFreq, viewedSignal.noiseData);
    viewedSignal.updateCanvas();
};

// noise slider view the change value
noiseInputSlider.onchange = function () {
    snrValueText.innerHTML = 'Value: ' + noiseInputSlider.value;
}

/**************************************************************************************
 *                       Application Logic (App Starts Here)
 **************************************************************************************/

Plotly.newPlot(
    "canvas-1",
    [
        {
            x: [],
            y: []
        }
    ],
    {
        font: {
            size: 12
        }
    },
    viewedSignal.config)
;

// the default signal
generateSignal(2, 3, 'cos', 4)
