import numpy
import numpy as np
from flask import Flask, request, render_template
from flask_cors import CORS
from scipy import signal

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
#                                   Global Variables
# --------------------------------------------------------------------------------------#
pi = 22 / 7

# --------------------------------------------------------------------------------------#
#                                   Helper Functions
# --------------------------------------------------------------------------------------#


def sample(time, amplitude, freq_sample):
    if len(time) == len(amplitude):
        points_per_indices = int((len(time) / time[-1]) / freq_sample)
        amplitude = amplitude[::points_per_indices]
        time = time[::points_per_indices]
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
    # get up parameters for signal generation

    freq = float(request.values['frequency'])  # get frequency from request & cast it to float
    amp = float(request.values['amplitude'])   # get amplitude from request & cast it to float
    signal_amp_type = request.values['type']       # get signal type (sine or cosine) from request

    # generate time for signal generation
    time = np.arange(0, 5, 0.01)

    if signal_amp_type == 'sine':
        signal_values = amp * np.sin(2 * pi * freq * time)  # generate the sine signal values
    elif signal_amp_type == 'cosine':
        signal_values = amp * np.cos(2 * pi * freq * time)  # generate the cosine signal values
    else:
        return 'invalid signal type'  # invalid request

    # set up the returned values before return
    returned_signal = list(time), list(signal_values)

    return list(returned_signal)


@app.route('/sample-signal', methods=['POST'])
def sample_signal():

    # get up parameters for signal sampling

    # get time values from request & cast it to float
    time_values = [float(i) for i in request.form.getlist('time[]')]

    # get amplitude from request & cast it to float
    signal_amp_values = [float(x) for x in request.form.getlist('values[]')]

    # get signal type (sine or cosine) from request
    sampling_frequency = int(request.values['samplingFrequency'])

    # sample the signal
    sampled_time_values, sampled_signal_values = sample(time_values, signal_amp_values, sampling_frequency)

    # cast numpy array to python list
    sampled_signal_result = list(sampled_time_values), list(sampled_signal_values)

    return list(sampled_signal_result)


@app.route('/add-signals', methods=['POST'])
def add_signal():

    # get up parameters for signal adding #

    # get amplitude of first signal from request & cast it to float array
    signal_1_amp = [float(i) for i in request.form.getlist('signal1[]')]

    # get amplitude of first signal from request & cast it to float array
    signal_2_amp = [float(x) for x in request.form.getlist('signal2[]')]

    signal_1_amp_np_array = np.array(signal_1_amp)      # convert python list to np array for easy adding amplitude
    signal_2_amp_np_array = np.array(signal_2_amp)      # convert python list to np array for easy adding amplitude

    # add the signals
    added_signal = signal_1_amp_np_array + signal_2_amp_np_array

    return list(added_signal)

# --------------------------------------------------------------------------------------#
#                                       Run App
# --------------------------------------------------------------------------------------#


if __name__ == "__main__":
    app.run(debug=True, port='5002')


