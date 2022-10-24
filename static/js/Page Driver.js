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
    redirect = document.getElementById('download-redirect')

/**     Combo Boxes  **/
let signalsComboBox = document.getElementById('current-components')


/**      Input Fields       **/
let frequencyInputField = document.getElementById('frequency'),
    amplitudeInputField = document.getElementById('amplitude'),
    typeInputField = document.getElementById('type'),
    samplingRateInputField = document.getElementById('sample'),
    noiseInputField = document.getElementById('myRange')

/**    tables     **/
let signalsTable = document.getElementById('signals')



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

        // default value for sine Type
        if (type === '' || type !== 'sine' || type !== 'cosine')
            type = 'sine'

        // default value for sampling frequency
        if (sampFreq === '')
            sampFreq = 2 * frequencyInputField.value


        // generate signal
        signal.addSignals(amplitudeInputField.value, frequencyInputField.value, type, sampFreq);
        signal.samplingFrequency = sampFreq

        let signalCount = signal.signalsCount
        let item = document.createElement('tr');
        item.setAttribute('id', `signal-table${signalCount}`);
        item.innerHTML = `
                    <td>Signal ${signalCount}</td>
                    <td>${frequencyInputField.value} Hz</td>
                    <td>${amplitudeInputField.value}</td>
                    <td>${type}</td>
    `
        signalsTable.appendChild(item)

        if (noiseInputField.value !== '') {
            signal.addNoise(noiseInputField.value);
            signal.motionPlot("canvas-1", signal.noiseData);
            await signal.motionPlot("canvas-1", signal.noiseData);
            signal.sampleSignal(samplingRateInputField.value, signal.noiseData);
        } else {
            signal.motionPlot("canvas-1", signal.data);         // plot signal
            await signal.motionPlot("canvas-1", signal.data);   // animate plot
            signal.sampleSignal(sampFreq);                             // sample the signal
        }

        signal.UpdateCanvas2(sampFreq);             // update down plot

        let option = document.createElement("option");
        option.text = ` (Signal${signalCount}) \t Amplitude= ${amplitudeInputField.value}, Frequency= ${frequencyInputField.value}`
        option.value = `Signal${signalCount}`
        signalsComboBox.appendChild(option);


    }

};

saveBtn.onclick = ()=>{
    let myCSVObject = []
    if (noiseInputField.checked) {
        myCSVObject = signal.exportSignalToCSV(signal.noiseData[0].x, signal.noiseData[0].y)
    }
    else{
        myCSVObject = signal.exportSignalToCSV(signal.reconstructedData[0].x, signal.reconstructedData[0].y)
    }
    let csv = 'x,y\n';

    myCSVObject.forEach(function(row) {
        csv += row.join(',');
        csv += "\n";
    });
    redirect.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
    redirect.download = `Signal${signal.signalsCount}`;
}

removeSignalBtn.onclick = async () => {
    console.log('gowa')
    signal.deleteSignal(signalsComboBox.value);

    // let removed = document.getElementById(`signal-table${signalsComboBox.selectedIndex}`)
    // console.log(signalsComboBox.selectedIndex)
    // removed.remove()

    if (noiseInputField.value > 0) {
        signal.addNoise(noiseInputField.value);
        signal.motionPlot("canvas-1", signal.noiseData);
        await signal.motionPlot("canvas-1", signal.noiseData);
        signal.sampleSignal(samplingRateInputField.value, signal.noiseData);
    } else {
        signal.motionPlot("canvas-1", signal.data);
        await signal.motionPlot("canvas-1", signal.data);
        signal.sampleSignal(samplingRateInputField.value);

    }
    signal.UpdateCanvas2(samplingRateInputField.value);
    signalsComboBox.remove(signalsComboBox.selectedIndex)
}

/**************************************************************************************
 *                             Event Handlers (On Input Change)
 **************************************************************************************/

uploadBtn.oninput = function (event) {
    let sampFreq = samplingRateInputField.value
    if (sampFreq === '')
        sampFreq = 0
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
        signal.UpdateCanvas2(sampFreq)

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


samplingRateInputField.onchange =  async function () {
    let samplingRate = samplingRateInputField.value;
    if(noiseInputField.value > 1){
        //recalculate the signal
        signal.sampleSignal(samplingRate, signal.noiseData);
    } else {
        signal.sampleSignal(samplingRate);
    }
    signal.UpdateCanvas2(samplingRate);
};


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
