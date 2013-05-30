<?php

class Point {
	protected $_x;
	protected $_y;

	function __construct($x, $y) {
		$this->_x = $x;
		$this->_y = $y;
	}

	function getX() {
		return $this->_x;
	}

	function getY() {
		return $this->_y;
	}
}

