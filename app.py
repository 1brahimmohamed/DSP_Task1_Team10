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
    signal_type = request.values['type']       # get signal type (sine or cosine) from request

    # generate time for signal generation
    time = np.arange(0, 5, 0.01)

    if signal_type == 'sine':
        signal_values = amp * np.sin(2 * pi * freq * time)  # generate the sine signal values
    elif signal_type == 'cosine':
        signal_values = amp * np.cos(2 * pi * freq * time)  # generate the cosine signal values
    else:
        return 'invalid signal type'  # invalid request

    # set up the returned values before return
    returned_signal = list(time), list(signal_values)

    return list(returned_signal)


@app.route('/sample-signal', methods=['POST'])
def sample_signal():

    # get up parameters for signal sampling
    time_values = [float(i) for i in request.form.getlist('time[]')]            # get time values from request & cast it to float
    signal_amp_values = [float(x) for x in request.form.getlist('values[]')]    # get amplitude from request & cast it to float
    sampling_frequency = int(request.values['samplingFrequency'])               # get signal type (sine or cosine) from request

    # sample the signal
    sampled_time_values, sampled_signal_values = sample(time_values, signal_amp_values, sampling_frequency)

    # cast numpy array to python list
    sampled_signal_result = list(sampled_time_values), list(sampled_signal_values)

    return list(sampled_signal_result)

# --------------------------------------------------------------------------------------#
#                                       Run App
# --------------------------------------------------------------------------------------#


if __name__ == "__main__":
    app.run(debug=True, port='5002')


