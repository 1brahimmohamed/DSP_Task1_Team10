class GenerateSignal {

    constructor() {
        /**
         * Signal Physical Characteristic
         * **/
        this.freq = 0;
        /** initial frequency = 0 **/
        this.amp = 0;
        /** initial amplitude = 0 **/
        this.type = 'sine'      /** initial signal type -> sine wave **/
        this.samplingFrequency = 0;

        this.xData = []
        this.yData = []

        /**
         * Plotting Configurations
         * **/
        this.data = [
            {
                x: this.xData,
                y: this.yData,
                mode: "lines",
                type: "scatter"
            }
        ];

        this.config = {
            responsive: true
        };

        this.layout = {
            title: "Signal displayed here",
            font: {size: 14},
        };
    }

    constructNewSignal(amplitude, frequency, type) {

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

        this.xData = xData;
        this.yData = yData;

        this.data = [
            {
                x: this.xData,
                y: this.yData,
                mode: "lines",
                type: "scatter"
            }
        ]

        return this.data;
    }

    plot(amplitude, frequency, type, div) {

        /**   generate new signal  **/
        const data = this.constructNewSignal(amplitude, frequency, type);


        /**  plot this signal   **/
        Plotly.newPlot(div, data, this.layout, this.config);
    }

    async changeAmplitude(amplitude) {
        this.amp = amplitude

        /**  generate new signal with the new amplitude   **/
        let data = this.constructNewSignal(amplitude, this.freq, this.type);

        /**  set layout   **/
        let layout = {
            title: "Signal displayed here",
            font: {
                size: 18
            },
            yaxis: {
                range: [-10, 10]
            }

        };

        /**   plot the new signal  **/
        await Plotly.animate(
            "plot1",
            {
                layout: layout,
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
            this.config
        );

    }

    async changeFrequency(frequency) {
        this.freq = frequency

        /**  generate new signal with the new frequency   **/
        let data = this.constructNewSignal(this.amp, frequency, this.type);

        /**  set layout   **/
        let layout = {
            title: "Signal displayed here",
            font: {
                size: 18
            },
            yaxis: {
                range: [-11, 11]
            },
            xaxis: {
                range: [0, 6]
            }

        };

        /**   plot the new signal  **/
        await Plotly.animate(
            "plot1",
            {
                layout: layout,
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
            this.config
        );

    }

    sampleSignal(rateOfSampling) {
        let sampledX = [];
        let sampledY = [];
        this.samplingFrequency = rateOfSampling;
        /**
         *  ajax call to retrieve sampled data from the server
         *  method -> post
         *  url -> visit sampling api
         *  dataType -> returned response formate
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
                time: this.xData,
                values: this.yData,
                samplingFrequency: this.samplingFrequency,
            },
            success: function (res, status, xhr) {
                sampledX = res[0];
                sampledY = res[1];
            }
        });

        let data = [
            {
                x: sampledX,
                y: sampledY,
                type: "line",
                mode: 'markers'
            }
        ]

        /**  set layout   **/
        let layout = {
            title: "Signal displayed here",
            font: {
                size: 18
            },
            yaxis: {
                range: [-11, 11]
            },
            xaxis: {
                range: [0, 6]
            }
        }

        /**   plot the new signal  **/
        Plotly.animate(
            "plot2",
            {
                layout: layout,
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
            this.config
        );
    }
}
