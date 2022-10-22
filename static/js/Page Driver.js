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
 *                                  Signal Generation
 **************************************************************************************/

let generateBtn = document.getElementById('generate'),
    signals = [],
    selectedUp,
    i = 0;

generateBtn.onclick = function () {
    let signal,
        freq, amp, type
    if (i%2 === 0){
        signal = new GenerateSignal();
        amp = 4
        freq = 2
        type = 'sine'
    }
    else{
        signal = new GenerateSignal();
        amp = 5
        freq = 5
        type = 'cosine'
    }
    i++
    signal.plot(amp, freq, type, 'canvas-1');

    let item = document.createElement('tr');
    item.innerHTML = `
                    <td>Signal ${signals.length}</td>
                    <td>${freq} Hz</td>
                    <td>${amp}</td>
                    <td>${type}</td>

    `
    document.getElementById('signals').appendChild(item)
    signals.push(signal)
    rowSelector()
}


// Plotly.newPlot('canvas-2',
//     [
//         {
//             x: [0],
//             y: [0]
//         }
//         ],
//     {
//         yaxis: {
//             range: [-11, 11]
//         }
//     })

let samplingInput = document.getElementById('sample');
samplingInput.onclick = function () {
    let samplingRate = samplingInput.value
    if (samplingRate !== 0)
        signals[0].sampleSignal(samplingRate)
}


function rowSelector(){
    $(".signal-table tr").click(function () {
        $(this).addClass('selected').siblings().removeClass('selected');
        selectedUp = $(this).index() - 1

        let barValues = $(".form-inline div").children()
        barValues[2].value = signals[selectedUp].samplingFrequency
        barValues[1].value = signals[selectedUp].amp
        barValues[0].value = signals[selectedUp].freq
    });
}