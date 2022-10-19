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

        /**
         * Plotting Configurations
         * **/
        this.data = [
            {
                x: [0],
                y: [0],
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
        let xdata = [];
        let ydata = [];

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
            url: 'http://127.0.0.1:5001/generate-signal',
            dataType: 'json',
            data: {
                type: type,
                frequency: frequency,
                amplitude: amplitude,
            },
            success: function (res, status, xhr) {
                xdata = res[0];
                ydata = res[1];
            }
        });

        /**   setting data to the plotting library  **/
        this.data = [
            {
                x: xdata,
                y: ydata,
                mode: "lines",
                type: "scatter"
            }
        ];
        return this.data;
    }

    plot(amplitude, frequency, type) {

        /**   generate new signal  **/
        const data = this.constructNewSignal(amplitude, frequency, type);

        /**  plot this signal   **/
        Plotly.newPlot("plot1", data, this.layout, this.config);
    }

    async change_amplitude(amplitude) {
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

    async change_frequency(frequency) {
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
            url: 'http://127.0.0.1:5001/sample-signal',
            dataType: 'json',
            data: {
                type: this.type,
                xdata: this.data.x,
                ydata: this.data.y,
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
