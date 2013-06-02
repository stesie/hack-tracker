<?php

class Hack {
	protected $_conn;
	protected $_docId;
	protected $_timestamp;
	protected $_hackSeq;
	protected $_multihackSeq;

	protected $_multihacks = array();
	protected $_changed = false;

	function __construct($conn, $docId, $timestamp, $hackSeq, $multihackSeq) {
		$this->_conn = $conn;
		$this->_docId = $docId;

		$this->_timestamp = $timestamp;
		$this->_timestampReadable = date('Y-m-d H:i:s', $timestamp);
		$this->_hackSeq = $hackSeq;
		$this->_multihackSeq = $multihackSeq;
	}

	function getTimestamp() {
		return $this->_timestamp;
	}

	function addMultihack($hack) {
		$this->_multihacks[] = $hack;
		$hack->setMultihackSeq(count($this->_multihacks));
	}

	function setMultihackSeq($seqNo) {
		if($this->_multihackSeq === $seqNo) {
			return;
		}

		if($this->_multihackSeq !== null) {
			echo "foobar $this\n";
		}

		$this->_multihackSeq = $seqNo;
		$this->_changed = true;
	}

	function setHackSeq($seqNo) {
		foreach($this->_multihacks as $child) {
			$child->setHackSeq($seqNo);
		}

		if($this->_hackSeq === $seqNo) {
			return;
		}

		if($this->_hackSeq !== null) {
			throw new LogicException('_hackSeq considered to be constant, but modified');
		}

		$this->_hackSeq = $seqNo;
		$this->_changed = true;
	}

	function store() {
		foreach($this->_multihacks as $child) {
			$child->store();
		}

		if($this->_changed) {
			$doc = $this->_conn->getDoc($this->_docId);

			$doc->{"derived-info"}->multihack = $this->_multihackSeq;
			$doc->{"derived-info"}->hack = $this->_hackSeq;

			$res = $this->_conn->storeDoc($doc);
			print_r($res);
		}
	}

	function __toString() {
		return $this->_docId;
	}
}
