# Webcam motion detection

This project only works on windows currently. If you want to use this on linux you will need to change the CameraStream class to use a different format (not dshow).

This project will capture all your webcams and monitor them for motion. when motion is detected it will save some time before, and during the motion.

# !Important!

-   it is worth noting the web panel is incredibly in-secure and thus you should never open this app to anything you dont trust.
-   the dvr 'replay' buffer has been disabled because it slows the program down to a halt very quickly.

# todo

-   better web panel
-   better solution for 'replay' buffer?
-   multi threading for when someone has a lot of cameras or a slow system
