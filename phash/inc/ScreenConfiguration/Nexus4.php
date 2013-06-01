<?php

require_once __DIR__.'/Interface.php';
require_once __DIR__.'/../Point.php';
require_once __DIR__.'/../Rectangle.php';

class ScreenConfiguration_Nexus4 implements ScreenConfiguration_Interface {
	const VIEWPORT_CENTER_X = 225;
	const VIEWPORT_CENTER_Y = 336;
	const VIEWPORT_MAX_WIDTH = 381;
	const VIEWPORT_MAX_HEIGHT = 371;

	function getViewportCenter() {
		return new Point(self::VIEWPORT_CENTER_X, self::VIEWPORT_CENTER_Y);
	}

	function getMaxDisplayWidth() {
		return self::VIEWPORT_MAX_WIDTH;
	}

	function getMaxDisplayHeight() {
		return self::VIEWPORT_MAX_HEIGHT;
	}

	function getCutoutArea() {
		return new Rectangle(212, 98, 68, 374);
	}
}

