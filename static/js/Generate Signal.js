class GenerateSignal {

    constructor() {
        /**
         * Signal Physical Characteristic
         * **/
        this.freq = 0;
        /** initial frequency = 0 **/
        this.amp = 0;
        /** initial amplitude = 0 **/
        this.type = 'sine'
        /** initial signal type -> sine wave **/
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
                type: "scatter"
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
                color: '#00b4fa'
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


        /**   Plot layout settings  */
        this.layout = {
            title: "Main Plot",
            xaxis: {
                title: {
                    text: 'time (s)',
                }
            },
            yaxis: {
                title: {
                    text: 'amplitude (mv)'
                }
            },
            font: {size: 12},
        };
    }

    constructNewSignal(amplitude, frequency, type = 'sine') {

        /**  empty string for expression to be expressed  **/
        this.freq = frequency;
        this.amp = amplitude;
        this.type = type;
        let xData, yData

        /**
         *  ajax call to retrieve data from the server
         *  method -> post
         *  url -> visit wave generation api
         *  dataType -> returned response formate
         *  data -> data to be sent to the server with the specifications
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

    plot(amplitude, frequency, type, div) {

        /**   generate new signal  **/
        const data = this.constructNewSignal(amplitude, frequency, type);

        /**  plot this signal   **/
        Plotly.newPlot(div, data, this.layout, this.config);
    }

    changeAmplitude(amplitude) {
        /** set the amplitude of this signal to new amplitude **/
        this.amp = amplitude

        /**  generate new signal with the new amplitude   **/
        this.constructNewSignal(amplitude, this.freq, this.type);
    }

    changeFrequency(frequency) {
        /** set the frequency of this signal to new frequency **/
        this.freq = frequency

        /**  generate new signal with the new frequency   **/
        this.constructNewSignal(this.amp, frequency, this.type);
    }

    sampleSignal(rateOfSampling, data = this.data) {
        let sampledX = [];
        let sampledY = [];
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

    addNoise(SNR) {
        if (SNR >= 0) {
            let noiseData;
            this.noiseData[0].x = this.data[0].x

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

    plotNoise() {
        /**  plot the noise on first canvas   **/
        Plotly.newPlot("canvas-1", this.noiseData, this.layout, this.config);
    }

    reconstructSignal(rateOfSampling) {
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
                sampledSignal: this.sampledData[0].y,
                sampledSignalFrequency: this.samplingFrequency,
            },
            success: function (res, status, xhr) {
                reconstructedY = res;
            }
        });

        /**  set the reconstruction data to the data coming from the server   */
        this.reconstructedData[0].x = reconstructedX;
        this.reconstructedData[0].y = reconstructedY
    }

    updateCanvas2(rateOfSampling) {

        /** reconstruct signal with the new sampling rate   **/
        this.reconstructSignal(rateOfSampling)

        /** set the plot name of the signals **/
        this.reconstructedData[0].name = 'Reconstructed'
        this.sampledData[0].name = 'Sampled'

        Plotly.newPlot(
            "canvas-2",
            [
                this.reconstructedData[0],
                this.sampledData[0]
            ],
            {
                title: "Processed Plot of the Signal",
                font: {
                    size: 12
                },
                xaxis: {
                    title: {
                        text: 'time(s)'
                    }
                },
                yaxis: {
                    title: {
                        text: 'amplitude(mV)'
                    }
                }
            },
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

    addSignals(amplitude, frequency, type) {
        let added = this.constructNewSignal(amplitude, frequency, type)
        let additionResult = []

        /**   first time make this signal = the signal data of y  **/
        if (this.signalsCount === 0) {
            this.data[0].y = added[0].y
            this.data[0].x = added[0].x
        } else {
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
            this.data[0].y = additionResult
        }

        this.signalsCount++;
        this.signalsList[`Signal${this.signalsCount}`] = added;
    }

    deleteSignal(signalName) {

        let deleted = this.signalsList[signalName]
        let subtractionResult = []

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

        this.data[0].y = subtractionResult;
        delete this.signalsList[signalName];
    }

    openSignalFromPC(file) {
        let time = []
        let values = []
        let keys = Object.keys(file[0])

        /** map through the file to extract values of the file **/

        file.map((d) => {
            time.push(d[keys[0]])
            values.push(d[keys[1]])
        })

        ++this.signalsCount;             /** increment the added signals array **/

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

