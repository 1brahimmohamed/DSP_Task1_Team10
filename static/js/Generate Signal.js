class GenerateSignal {

    constructor() {
        /**
         * Signal Physical Characteristic
         * **/
        this.freq = 0;
        /** initial frequency = 0 **/
        this.amp = 0;
        /** initial amplitude = 0 **/
        this.type = 'sin'
        /** initial signal type -> sin wave **/
        this.samplingFrequency = 0;

        /** Signal X,Y Values **/

        this.signalsCount = 0;
        this.signalsList = {}

        /** Signal Plotting Configurations **/
        this.data = [
            {
                x: [0],
                y: [0],
                mode: "lines",
                type: "scatter",
                name: 'Signal'
            }
        ];

        /** Noise Plotting Configurations **/
        this.noiseData = [{
            x: [],
            y: [],
            mode: "lines",
            type: "scatter"
        }]

        /**   Sampled Signal Data Configurations  */
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

        /**  Plot Configuration Object
         *  responsive: -> make responsive layout
         *  editable: -> enable editing options for the plot
         *  displaylogo: -> hide plotly logo
         * **/
        this.config = {
            responsive: true,
            editable: true,
            displaylogo: false
        };


        /**   Plot layout settings
         * xaxis: -> propetries of xaxis
         *      title.text: -> title of x axis
         * yaxis: -> propetries of yaxis
         *      title.text: -> title of x yxis
         * */
        this.layout = {
            xaxis: {
                title: {
                    text: 'time (s)',
                }
            },
            yaxis: {
                title: {
                    text: 'amplitude (mV)'
                }
            },
            font: {size: 12},
        };
    }

    /**************************************************************************************
     *                           Operations on signal functions
     **************************************************************************************/

    constructNewSignal(amplitude, frequency, type = 'sin') {

        /**  setting the coming value to this signal **/
        this.freq = frequency;
        this.amp = amplitude;
        this.type = type;

        /**   new values to store the response of server  **/
        let xData, yData

        /**
         *  ajax call to retrieve data from the server
         *  method -> post
         *  url -> visit wave generation api
         *  dataType -> returned response format
         *  data -> data to be sent to the server with the specification
         *  res[0] -> time array
         *  res[1] -> values array
         * **/

        $.ajax({
            method: 'POST',
            url: 'http://127.0.0.1:5002/generate-signal',
            dataType: 'json',
            async: false,
            data: {
                type: type,
                frequency: frequency,
                amplitude: amplitude,
            },
            success: function (res, status, xhr) {
                xData = res[0];
                yData = res[1];
            }
        });

        return [
            {
                x: xData,
                y: yData,
                mode: "lines",
                type: "scatter"
            }
        ];
    }

    sampleSignal(rateOfSampling, data = this.data) {

        /**   new values to store the response of server  **/
        let sampledX = [];
        let sampledY = [];

        /** set the sampling frequency to the coming signal frequency**/
        this.samplingFrequency = rateOfSampling;

        /**
         *  ajax call to retrieve sampled data from the server
         *  method -> post
         *  url -> visit sampling api
         *  dataType -> returned response format
         *  data -> data to be sent to the server with the x, y values
         *  res[0] -> samples time array
         *  res[1] -> sampled values array
         * **/

        $.ajax({
            method: 'POST',
            url: 'http://127.0.0.1:5002/sample-signal',
            dataType: 'json',
            async: false,
            data: {
                time: data[0].x,
                values: data[0].y,
                samplingFrequency: this.samplingFrequency,
            },
            success: function (res, status, xhr) {
                sampledX = res[0];
                sampledY = res[1];
            }
        });

        /**  set the sampling data to the data coming from the server   */
        this.sampledData = [
            {
                x: sampledX,
                y: sampledY,
                type: "line",
                mode: 'markers'
            }
        ]
    }

    addSignals(amplitude, frequency, type) {
        /**  generate new signal with the given values   **/
        let added = this.constructNewSignal(amplitude, frequency, type)

        /**   new value to store the response of server  **/
        let additionResult = []




        /**   first time make this signal = the signal data of y  **/
        if (this.signalsCount === 0) {
            this.data[0].y = added[0].y
            this.data[0].x = added[0].x
        } else {

            /**
             *  ajax call to retrieve added signals data from the server
             *  method -> post
             *  url -> visit reconstruction api
             *  dataType -> returned response format
             *  data -> data to be sent to the server with the sampled signal & sampling frequency
             *  res -> added signal array
             * **/

            $.ajax({
                method: 'POST',
                url: 'http://127.0.0.1:5002/add-signals',
                async: false,
                dataType: 'json',
                data: {
                    signal1: this.data[0].y,
                    signal2: added[0].y,
                },
                success: function (res, status, xhr) {
                    additionResult = res;
                }
            });
            /**   set the new data of y to the result of addition  **/
            this.data[0].y = additionResult
        }

        /**   increment the signal count  **/
        this.signalsCount++;

        /**   add signal to the list  **/
        this.signalsList[`Signal${this.signalsCount}`] = added;
    }

    deleteSignal(signalName) {
        /**  get the deleted signal fro the list   **/
        let deleted = this.signalsList[signalName]

        /**   new values to store the response of server  **/
        let subtractionResult = []

        /**
         *  ajax call to retrieve deleted data from the server
         *  method -> post
         *  url -> visit reconstruction api
         *  dataType -> returned response format
         *  data -> data to be sent to the server with the sampled signal & sampling frequency
         *  res -> deleted signal array
         * **/

        $.ajax({
            method: 'POST',
            url: 'http://127.0.0.1:5002/subtract-signals',
            async: false,
            dataType: 'json',
            data: {
                signal1: this.data[0].y,
                signal2: deleted[0].y,
            },
            success: function (res, status, xhr) {
                subtractionResult = res;
            }
        });

        /**   set the new data of y to the result of subtraction  **/
        this.data[0].y = subtractionResult;

        /**   deleted signal from the list  **/
        delete this.signalsList[signalName];

        /**   decrement the signal count  **/
        this.signalsCount--;
    }

    addNoise(SNR) {
        if (SNR >= 0) {

            /**   new value to store the response of server  **/
            let noiseData;

            /**
             *  ajax call to retrieve noise data from the server
             *  method -> post
             *  url -> visit noise api
             *  dataType -> returned response format
             *  data -> data to be sent to the server with the signal time & amplitude
             *  res -> noise signal array
             * **/

            $.ajax({
                method: 'POST',
                url: 'http://127.0.0.1:5002/add-noise',
                async: false,
                dataType: 'json',
                data: {
                    time: this.data[0].x,
                    signal: this.data[0].y,
                    SNR: SNR
                },
                success: function (res, status, xhr) {
                    noiseData = res;
                }
            });

            /**  set the noise data to the data coming from the server   */
            this.noiseData[0].x = this.data[0].x
            this.noiseData[0].y = noiseData


        }
    }

    reconstructSignal() {

        /**   new values to store the response of server  **/
        let reconstructedX = []
        let reconstructedY = []

        /** time value of the reconstructed Signal**/
        reconstructedX = this.data[0].x;

        /**
         *  ajax call to retrieve reconstructed data from the server
         *  method -> post
         *  url -> visit reconstruction api
         *  dataType -> returned response format
         *  data -> data to be sent to the server with the sampled signal & sampling frequency
         *  res -> reconstructed signal array
         * **/

        $.ajax({
            method: 'POST',
            url: 'http://127.0.0.1:5002/reconstruct-signal',
            async: false,
            dataType: 'json',
            data: {
                time: this.data[0].x,
                sampledTime: this.sampledData[0].x,
                sampledSignal: this.sampledData[0].y
            },
            success: function (res, status, xhr) {
                reconstructedY = res;
            }
        });

        /**  set the reconstruction data to the data coming from the server   */
        this.reconstructedData[0].x = reconstructedX;
        this.reconstructedData[0].y = reconstructedY
    }

    /**************************************************************************************
     *                                Plotting Functions
     **************************************************************************************/

    plot(amplitude, frequency, type, div) {

        /**   generate new signal  **/
        const data = this.constructNewSignal(amplitude, frequency, type);

        /**  plot this signal   **/
        Plotly.newPlot(div, data, this.layout, this.config);
    }

    updateCanvas() {

        /** reconstruct signal with the new sampling rate   **/
        this.reconstructSignal()

        /** set the plot name of the signals **/
        this.reconstructedData[0].name = 'Reconstructed'
        this.sampledData[0].name = 'Sampled'
        this.noiseData[0].name = 'Signal with Noise'

        let data = []

        /**   if the noise is enabled (SNR < 100) update the canvas with the noise data
         *    else if the noise is not enabled (SNR = 100) update the canvas with the normal data
         * **/
        if (noiseInputSlider.value < 100) {
            data =
                [
                    this.noiseData[0],
                    this.reconstructedData[0],
                    this.sampledData[0]
                ]
        } else {
            data =
                [
                    this.data[0],
                    this.reconstructedData[0],
                    this.sampledData[0]
                ]
        }

        /**  plot the new data   **/
        Plotly.newPlot(
            "canvas-1",
            data,
            this.layout,
            this.config,
        );

    }

    async motionPlot(canvas, data) {

        /**   use Plotly .animate Function **/
        await Plotly.animate(
            canvas,
            {
                layout: this.layout,
                data: data,
                traces: [0]

            },
            {
                transition: {
                    duration: 500,
                    easing: "cubic-in-out",
                },
                frame: {
                    duration: 500,
                },
            },
            this.config,
            this.layout
        );
    }


    /**************************************************************************************
     *                             Open & Save Functions
     **************************************************************************************/

    openSignalFromPC(file) {
        let time = []
        let values = []
        let keys = Object.keys(file[0])

        /** map through the file to extract values of the file **/
        file.map((d) => {
            time.push(d[keys[0]])
            values.push(d[keys[1]])
        })

        /** increment the added signals array **/
        ++this.signalsCount;

        /**  set the value of the current signal to the values coming from the file  **/
        this.data[0].x = time;
        this.data[0].y = values;

        /**  add the signal data to the list of the signals   **/
        this.signalsList[`Signals ${this.signalsCount}`] = [
            {
                x: this.data[0].x,
                y: this.data[0].y,
                mode: 'lines',
                type: 'scatter'
            }
        ]
    }

    exportSignalToCSV(x, y) {

        let csv = []        // create object 'csv' to store signal values
        for (let i = 0; i < x.length; ++i) {
            csv.push([x[i], y[i]])
        }
        /**  object returned to be converted to CSV   **/
        return csv
    }
}

