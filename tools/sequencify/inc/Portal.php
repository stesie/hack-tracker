<?php

require_once __DIR__.'/Hack.php';

class Portal {
	protected $_hacks;

	function addHack(Hack $hack) {
		$this->_hacks[$hack->getTimestamp()] = $hack;
	}

	function moveMultihacks() {
		asort($this->_hacks);

		$lastHack = null;
		$lastStamp = null;

		foreach($this->_hacks as $curStamp => $curHack) {
			if($lastStamp !== null) {
				if($curStamp - $lastStamp < 30) {
					$lastHack->addMultihack($curHack);
					unset($this->_hacks[$curStamp]);
					continue;
				}

				if($curStamp - $lastStamp < 300) {
					printf("Fnords at %s, portal re-hacked after %d seconds ...\n", $curHack, $curStamp - $lastStamp);
				}
			}

			$lastStamp = $curStamp;
			$lastHack = $curHack;
		}
	}

	function flagHackSequence() {
		asort($this->_hacks);
		$sequence = array();

		foreach($this->_hacks as $curStamp => $curHack) {
			if(!empty($sequence) && $curStamp - $firstStamp < 14400) {
				$sequence[] = $curHack;
				continue;
			}

			$this->_applySequence($sequence);
			$sequence = array($curHack);
			$firstStamp = $curHack->getTimestamp();
		}

		$this->_applySequence($sequence);
	}

	protected function _applySequence($sequence) {
		if(count($sequence) != 4) {
			return;
		}

		for($i = 0; $i < 4; $i ++) {
			$sequence[$i]->setHackSeq($i + 1);
		}
	}

	function store() {
		foreach($this->_hacks as $hack) {
			$hack->store();
		}
	}
}
