import numpy as np
from flask import Flask, request, render_template
from flask_cors import CORS
import pandas as pd

# Create flask application
app = Flask(__name__)

# Cross-origin resource sharing error handling
CORS(app)
cors = CORS(app, resources={
    r"/*": {
        'origins': '*'
    }
})


# --------------------------------------------------------------------------------------#
#                                   Helper Functions
# --------------------------------------------------------------------------------------#


def sample(time, amplitude, freq_sample):

    # time list must be equal to amplitude list
    if len(time) == len(amplitude):
        # get points per time
        points_per_indices = round((len(time) / time[-1]) / freq_sample)

        # extract the sampled time points by taking a value each step ( step point= points_per_indices)
        time = time[::points_per_indices]

        # extract the sampled y points by taking a value each step ( step point= points_per_indices)
        amplitude = amplitude[::points_per_indices]

        return time, amplitude


# --------------------------------------------------------------------------------------#
#                                       Routes
# --------------------------------------------------------------------------------------#

# root route
@app.route('/')
def home():
    return render_template('index.html')


@app.route('/generate-signal', methods=['POST'])
def generate_signal():
    # get up parameters from the frontend for signal generation

    freq = float(request.values['frequency'])  # get frequency from request & cast it to float
    amp = float(request.values['amplitude'])  # get amplitude from request & cast it to float
    signal_type = request.values['type']  # get signal type (sin or cos) from request

    # generate time for signal generation
    time = np.linspace(0, 6, 1500)

    # set the signal type
    if signal_type == 'sin':
        signal_y_values = amp * np.sin(2 * np.pi * freq * time)  # generate the sin signal values
    elif signal_type == 'cos':
        signal_y_values = amp * np.cos(2 * np.pi * freq * time)  # generate the cos signal values
    else:
        return 'invalid signal type'  # invalid request

    # set up the returned values before return
    returned_signal = list(time), list(signal_y_values)

    return list(returned_signal)


@app.route('/sample-signal', methods=['POST'])
def sample_signal():
    # get up parameters from the frontend for signal sampling #

    # get time values from request & cast it to float
    time_values = [float(i) for i in request.form.getlist('time[]')]

    # get amplitude from request & cast it to float
    signal_amp_values = [float(x) for x in request.form.getlist('values[]')]

    # get signal type (sin or cos) from request
    sampling_frequency = float(request.values['samplingFrequency'])

    # sample the signal
    sampled_time_values, sampled_signal_values = sample(time_values, signal_amp_values, sampling_frequency)

    # cast numpy array to python list
    sampled_signal_result = list(sampled_time_values), list(sampled_signal_values)

    return list(sampled_signal_result)


@app.route('/add-signals', methods=['POST'])
def add_signal():
    # get up parameters from the frontend for signal adding #

    # get amplitude of first signal from request & cast it to float array
    signal_1_amp = [float(i) for i in request.form.getlist('signal1[]')]

    # get amplitude of second signal from request & cast it to float array
    signal_2_amp = [float(x) for x in request.form.getlist('signal2[]')]

    signal_1_amp_np_array = np.array(signal_1_amp)  # convert python list to np array for easy adding amplitude
    signal_2_amp_np_array = np.array(signal_2_amp)  # convert python list to np array for easy adding amplitude

    # add the signals
    added_signal = signal_1_amp_np_array + signal_2_amp_np_array

    return list(added_signal)


@app.route('/subtract-signals', methods=['POST'])
def subtract_signal():
    # get up parameters from the frontend  for signal subtraction #

    # get amplitude of first signal from request & cast it to float array
    signal_main = [float(i) for i in request.form.getlist('signal1[]')]

    # get amplitude of second signal from request & cast it to float array
    signal_to_be_subtracted = [float(x) for x in request.form.getlist('signal2[]')]

    # convert python list to np array for easy subtracting amplitude
    signal_1_amp_np_array = np.array(signal_main)

    # convert python list to np array for easy subtracting amplitude
    signal_2_amp_np_array = np.array(signal_to_be_subtracted)

    # subtract the signal
    subtracted_signal = signal_1_amp_np_array - signal_2_amp_np_array

    return list(subtracted_signal)


@app.route('/add-noise', methods=['POST'])
def add_noise():
    # get up parameters from the frontend for noise addition #

    #  get time and cast it to float
    time = [float(i) for i in request.form.getlist('time[]')]

    # get signal and cast it to float
    signal = [float(i) for i in request.form.getlist('signal[]')]

    # get signal-to-noise ratio and cast it to float
    signal_to_noise_ratio = float(request.values['SNR'])

    signal_np = np.array(signal)     # convert python list to numpy array

    initial_noise = np.random.uniform(low=0, high=1, size=len(time))  # generate noise

    # get A factor as SNR = signal power/ A * noise power
    # signal power = signal values ^2, noise power = noise values ^2
    # SNR = Power(Signal)/A*Power(Noise)
    a_factor = (np.mean(signal_np**2)) / (signal_to_noise_ratio * np.mean(np.square(initial_noise)))

    final_noise = a_factor * initial_noise          # the signal according to the SNR
    signal_with_noise = signal + final_noise        # add noise

    return list(signal_with_noise)


@app.route('/reconstruct-signal', methods=['POST'])
def signal_reconstruction():
    # get up parameters from the frontend for signal reconstruction #

    #  get time values and cast it to float
    time = [float(i) for i in request.form.getlist('time[]')]

    #  get sampled points time values and cast it to float
    sampled_time = [float(i) for i in request.form.getlist('sampledTime[]')]

    #  get sampled points y value and cast it to float
    sampled_signal = [float(i) for i in request.form.getlist('sampledSignal[]')]

    # matrix that have all the time points
    matrix_time = np.resize(time, (len(sampled_time), len(time)))

    # apply the ((t - nT)/T) equation
    # make broadcasting
    interpolation = (matrix_time.T - sampled_time) / (sampled_time[1] - sampled_time[0])

    # Reconstruct the signal with the sinc interpolation = x[n] sinc(v)
    matrix_result = sampled_signal * np.sinc(interpolation)

    # get the reconstructed y vales by summing all the values
    reconstructed_signal_y = np.sum(matrix_result, axis=1)

    return list(reconstructed_signal_y)


# --------------------------------------------------------------------------------------#
#                                       Run App
# --------------------------------------------------------------------------------------#


if __name__ == "__main__":
    app.run(debug=True, port=5002)
