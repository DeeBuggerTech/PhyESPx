# PhyESPx <img src="https://user-images.githubusercontent.com/73055949/134799502-acd9a22d-0cd9-4834-9d5f-f509eb8aba9c.png" height="45" align="right"> <br>
... is a wireless, modular system for data acquisition. Different "sensor heads" can be attached to a "server" which then reads the data from the sensor and can display it via an individually configurable web interface. The "server" hardware consists of an ESP32 microcontroller from the Chinese supplier Espressiv Systems and a battery (+circutry) and is therefore able to wirelessly and autonomously transmit measured values to the web interface (which allows the use of the sensor kit in connection with tablets / devices that don't have a USB-A jack). 
The "senor hats" obviously contain some kind of sensor (sometimes connected to a level shifter for the data lines) attached to a male connector, which fits the female connector of the server.

<h3>Hardware in detail:</h3>
I decided for an ESP32 as the heart of this project, since it's relatively fast, has a built-in wifi chip + antenna and quite some GPIOs supporting protocols like I²C, SPI etc. I used a single-cell 18650 battery shield for autonomous operation, but since the cell is quite oversized for our energy needs, it will be replaced by a way smaller one in the upcoming versions. A WS2812b LED does a great job as status led - however you could also just use an analog RGB LED and PWM. The toggle buttons are directly connected to the battery shield / microcontroller, since the battery shield already seems to have some kind of debouncing circuitry and we can easily prevent the start/stop button from unwanted triggering by adding a simple temporal condition.
<br><br>
Plans for the upcoming versions:
<ul>
<li>replace the battery with a smaller one</li>
<li>design a PCB to directly fit the ESP-32 SoC, the charge regulator (maybe tp4056) and all the other electrical components</li>
<li>redesign the case & build some sensor cases</li>
<li>redesign the connection between the server & the sensor hat (maybe something like just like this)</li>
<li>...</li>
</ul>

<br>

<h3>Software in detail:</h3>
Since I had decided that the project should be able to operate wirelessly and I chose WiFi as a communication network, I had 2 ways to display the gathered data on the client device. I could've developed some application for the different operating systems, which would have been more efficient than my current solution and might have prevented me from some trouble, I'm now running into, but I decided for a web application since you don't have to install anything and it might also be compatible with older devices. Therefore, the server code I'm using contains all the necessary imports and method calls to provide a website from an HMTL file (which is stored in the internal 4MB SPIFFS), when getting an HTTP request on port 80. Since I wasn't satisfied with my GUI design and I remembered the phyphox web interface from some physics lessons, I took a look at the phyphox GitHub page and immediately fell in love with the style of coding and the modular concept. I took the phyphox HTML and split off some javascript methods and the chart library in order to cache the file in the client browser and reduce the necessary data traffic for each load of the UI. Finally, I modified the backend to work with my slimmed-down version of the data transmission protocol (a simple JSON-via-HTTP transmission, which will be replaced by web sockets in the upcoming versions). I had to implement a corresponding value transmitter on the ESP. Since the state of the experiment (running/stop) is defined by the server, it was quite easy to add an hardware interrupt to start / stop the experiments. 
<br><br>
Plans for the upcoming versions:
<ul>
<li>implement a new data transmission protocol using web sockets</li>
<li>build an application (maybe also a web application) to individually generate new UIs based on the elements from the phyphox web interface according to the individual sensor type</li>
<li>beautify and comment the code</li>
<li>...</li>
</ul>

<br>

<h3>Advantages of phyESPx:</h3>
<ul>
<li>easy to handle</li>
<li>modular</li>
<li>extremely cheap</li>
<li>works with nearly all laptops/tablets/phones</li>
<li>no need to install an application on the client device</li>
<li>extendable (you can develop new sensor hats according to your needs)</li>
<li>open source</li>
<li>can be built & inspected in informatics lessons and used for physics lessons</li>
</ul>

<br>

<h3>How can I build one by myself?</h3>
<a href="https://github.com/DeeBuggerTech/PhyESPx/blob/main/additional_resources/parts_lists">Here</a>, you will find a list of all the parts I've used for the build of the current version. You can <a href="https://github.com/DeeBuggerTech/PhyESPx/blob/main/additional_resources/3d_models">download the 3D-Modells</a> or design your own case and finally print or order it. All the connections can be found in the <a href="https://github.com/DeeBuggerTech/PhyESPx/blob/main/additional_resources/wiring_diagram">wiring diagram</a>. Use the Arduino IDE (you might have to install the esp32 boards package and the esp32 spiffs upload feature) to upload the sketches and the web interface to the microcontroller.

<h3>How I came up with the project idea:</h3>
Thanks to a lucky coincidence, I was able to take part in a <a href="http://eupantec2019.eu">EUPANTEC</a> meeting in 2019. 
Eupantec is a meeting of small groups of students from five European countries, financed by the <a href="https://erasmus-plus.ec.europa.eu/">Erasmus +</a> program, where different measurement methods for physics education are tested and discussed together. 
It was a great experience for me and I continued to deal with the topic afterwards, and finally found my own project...


<h3>Special thanks to...</h3>
<ul>
  <li>The <a href="https://github.com/phyphox">phyphox</a> developer <a href="https://github.com/Staacks"><b>Dr. Sebastian Staacks</b></a> for building one of my favorite applications and for providing their great source code for free on GitHub!</li>
  <li><b>Moritz Riker</b>, who supported me in all kinds of ways, particularly by designing and printing the great casing for this project.</li>
  <li><b>The EU</b> which offers you the opportunity to take part in such meetings, where I learned a lot about the subject, the country and got to know a lot of nice people.</li>
</ul>

<h3>Used libraries</h3>

<h4>chart.js</h4>

This web interface uses the JavaScript plotting library <a href="http://chartjs.org">chart.js</a>. Chart.js is distributed under the following licence.

The MIT License (MIT)

Copyright (c) 2018 Chart.js Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
