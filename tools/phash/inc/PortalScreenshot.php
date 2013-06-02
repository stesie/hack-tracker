<?php

require_once __DIR__.'/AbstractPortalImage.php';

class PortalScreenshot extends AbstractPortalImage {
	function getHashRectangle() {
		return $this->getScreenConfiguration()->getCutoutArea();
	}
}
