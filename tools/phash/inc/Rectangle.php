<?php

class Rectangle {
	protected $_width;
	protected $_height;
	protected $_left;
	protected $_top;

	function __construct($width, $height, $left, $top) {
		$this->_width = $width;
		$this->_height = $height;
		$this->_left = $left;
		$this->_top = $top;
	}

	function getWidth() {
		return $this->_width;
	}

	function getHeight() {
		return $this->_height;
	}

	function getLeft() {
		return $this->_left;
	}

	function getTop() {
		return $this->_top;
	}

	function __toString() {
		return sprintf('%dx%d+%d+%d', $this->_width, $this->_height, $this->_left, $this->_top);
	}
}
