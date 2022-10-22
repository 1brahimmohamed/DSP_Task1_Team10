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
 *                                  Upper Bar Handler
 **************************************************************************************/


let sin_wave = new GenerateSignal();
sin_wave.plot(10, 0.5, 'sine', 'canvas-1');

Plotly.newPlot('canvas-2',
    [
        {
            x: [0],
            y: [0]
        }
        ],
    {
        yaxis: {
            range: [-11, 11]
        }
    })