<?php

require_once __DIR__.'/AbstractPortalImage.php';

class PortalImage extends AbstractPortalImage {
	function getImageRectangle() {
		$imgWidth = imagesx($this->_img);
		$imgHeight = imagesy($this->_img);

		if($imgWidth > $imgHeight) {
			$dispWidth = $this->getScreenConfiguration()->getMaxDisplayWidth();
			$dispHeight = intval($dispWidth / $imgWidth * $imgHeight);
		}
		else {
			$dispHeight = $this->getScreenConfiguration()->getMaxDisplayHeight();
			$dispWidth = intval($dispHeight / $imgHeight * $imgWidth);
		}

		return new Rectangle(
				$dispWidth,
				$dispHeight,
				$this->getScreenConfiguration()->getViewportCenter()->getX() - $dispWidth / 2,
				$this->getScreenConfiguration()->getViewportCenter()->getY() - $dispHeight / 2
			);
	}

	function getHashRectangle() {
		$imageRect = $this->getImageRectangle();
		$cutRect = $this->getScreenConfiguration()->getCutoutArea();

		$relLeft = ($cutRect->getLeft() - $imageRect->getLeft()) / $imageRect->getWidth();
		$relWidth = $cutRect->getWidth() / $imageRect->getWidth();
		$relTop = ($cutRect->getTop() - $imageRect->getTop()) / $imageRect->getHeight();
		$relHeight = $cutRect->getHeight() / $imageRect->getHeight();

		return new Rectangle(
				$relWidth * imagesx($this->_img),
				$relHeight * imagesy($this->_img),
				$relLeft * imagesx($this->_img),
				$relTop * imagesy($this->_img)
			);
	}
}
