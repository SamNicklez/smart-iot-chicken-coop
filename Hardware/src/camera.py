#Code to take a photo and add to a file
import cv2
import time

cam = cv2.VideoCapture(0)

while True:
	time.sleep(1)
	ret, image = cam.read()
	cv2.imwrite('/home/pi/CameraStuff/testimage.jpg', image) 
	time.sleep(1)
	#k = cv2.waitKey(1)
	#if k != -1:
	#	break
#cv2.imwrite('/home/pi/testimage.jpg', image)
cam.release()
cv2.destroyAllWindows()