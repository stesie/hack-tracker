<?php

require_once __DIR__.'/ScreenConfiguration/Interface.php';

abstract class AbstractPortalImage {
	protected $_screenConfig;
	protected $_img;

	function __construct(ScreenConfiguration_Interface $screenConfig, $filePathName) {
		$this->_screenConfig = $screenConfig;

		$info = getimagesize($filePathName);

		switch($info['mime']) {
			case 'image/jpeg':
				$this->_img = imagecreatefromjpeg($filePathName);
				break;

			case 'image/png':
				$this->_img = imagecreatefrompng($filePathName);
				break;

			default:
				throw new RuntimeException('Unsupported image mime-type: '.$info['mime']);
		}
	}

	function getHash() {
		$hashRect = $this->getHashRectangle();

		$hashImg = imagecreatetruecolor($hashRect->getWidth(), $hashRect->getHeight());
		imagecopy($hashImg, $this->_img, 0, 0, $hashRect->getLeft(), $hashRect->getTop(),
				  $hashRect->getWidth(), $hashRect->getHeight());

		$tempFile = tempnam('', 'phashr');
		imagepng($hashImg, $tempFile, 0);

		$hash = ph_dct_imagehash($tempFile);
		unlink($tempFile);

		return $hash;
	}

	function getScreenConfiguration() {
		return $this->_screenConfig;
	}

	abstract function getHashRectangle();
}

