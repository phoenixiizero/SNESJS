//SNESJS by simplyianm

SNESJS = function() {
    
}


/*
 * This file is part of SNESJS.
 *
 * SNESJS is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * SNESJS is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with SNESJS.  If not, see <http://www.gnu.org/licenses/>.
 */

var PORT_1 = 0;
var PORT_2 = 1;

var DEVICE_NONE = 0;
var DEVICE_JOYPAD = 1;
var DEVICE_MULTITAP = 2;
var DEVICE_MOUSE = 3;
var DEVICE_SUPERSCOPE = 4;
var DEVICE_JUSTIFIER = 5;
var DEVICE_JUSTIFIERS = 6;

var JOYPAD_B = 1 << 0;
var JOYPAD_Y = 1 << 1;
var JOYPAD_SELECT = 1 << 2;
var JOYPAD_START = 1 << 3;
var JOYPAD_UP = 1 << 4;
var JOYPAD_DOWN = 1 << 5;
var JOYPAD_LEFT = 1 << 6;
var JOYPAD_RIGHT = 1 << 7;
var JOYPAD_A = 1 << 8;
var JOYPAD_X = 1 << 9;
var JOYPAD_L = 1 << 10;
var JOYPAD_R = 1 << 11;

var MOUSE_X = 1 << 0;
var MOUSE_Y = 1 << 1;
var MOUSE_LEFT = 1 << 2;
var MOUSE_RIGHT = 1 << 3;

var SUPERSCOPE_X = 1 << 0;
var SUPERSCOPE_Y = 1 << 1;
var SUPERSCOPE_TRIGGER = 1 << 2;
var SUPERSCOPE_CURSOR = 1 << 3;
var SUPERSCOPE_TURBO = 1 << 4;
var SUPERSCOPE_PAUSE = 1 << 5;

var JUSTIFIER_X = 1 << 0;
var JUSTIFIER_Y = 1 << 1;
var JUSTIFIER_TRIGGER = 1 << 2;
var JUSTIFIER_START = 1 << 3;

var REGION_NTSC = 0;
var REGION_PAL = 1;

var MEMORYTYPE_RAM = 0;
var MEMORYTYPE_RTC = 1;
var MEMORYTYPE_BSXRAM = 2;
var MEMORYTYPE_BSXPRAM = 3;
var MEMORYTYPE_SUFAMITURBOARAM = 4;
var MEMORYTYPE_SUFAMITURBOBRAM = 5;
var MEMORYTYPE_GAMEBOYRAM = 6;
var MEMORYTYPE_GAMEBOYRTC = 7;


/*
 * This file is part of SNESJS.
 *
 * SNESJS is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * SNESJS is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with SNESJS.  If not, see <http://www.gnu.org/licenses/>.
 */

var TBL_EM = 0;
var TBL_MX = 256;
var TBL_Mx = 512;
var TBL_mX = 768;
var TBL_mx = 1024;

var OPCODE_A = 0;
var OPCODE_X = 1;
var OPCODE_Y = 2;
var OPCODE_Z = 3;
var OPCODE_S = 4;
var OPCODE_D = 5;

SNESJS = function() {}

SNESJS.CPU = function(snes) {
	this.snes = snes;

	this.alu = new SNESJS.CPU.ALU();

	this.regs = new SNESJS.CPU.Regs();
	this.aa = new SNESJS.CPU.Reg24();
	this.rd = new SNESJS.CPU.Reg24();
	this.sp = 0;
	this.dp = 0;

	this._cpu_version = 0;

	this.initialize_opcode_table();
}

SNESJS.CPU.prototype.step = function(clocks) {
	snes.smp.clock -= clocks * snes.smp.frequency;
	snes.ppu.clock -= clocks;
	for (var i = 0; i < snes.coprocessors.length; i++) {
		var chip = coprocessors[i];
		chip.clock -= clocks * chip.frequency;
	}
}

SNESJS.CPU.prototype.synchronize_smp = function() {
	while(snes.smp.clock < 0) {
		snes.smp.enter();
	}
}

SNESJS.CPU.prototype.synchronize_ppu = function() {
	while(snes.ppu.clock < 0) {
		snes.ppu.enter();
	}
}

SNESJS.CPU.prototype.synchronize_coprocessors = function() {
	for (var i = 0; i < cpu.coprocessors.length; i++) {
		var chip = cpu.coprocessors[i];
		if (chip.clock < 0) {
			//sync
		}
	}
}

SNESJS.CPU.prototype.synchronize_controllers = function() {

}

SNESJS.CPU.prototype.enter = function() {
	while(true) {
		if (status.nmi_pending) {
			status.nmi_pending = false;
			this.regs.vector = (this.regs.e == false ? 0xffee : 0xfffe);
			this.op_irq();
		}

		if (status.irq_pending) {
			status.irq_pending = false;
			this.regs.vector = (this.regs.e == false ? 0xffee : 0xfffe);
			this.op_irq();
		}

		this.op_step();
	}
}

SNESJS.CPU.prototype.op_step = function() {
	this.optable[this.op_readpc()]();
}

SNESJS.CPU.prototype.cpu_wram_reader = function(addr) {
	return this.wram[addr];
}

SNESJS.CPU.prototype.cpu_wram_writer = function(addr, data) {
	this.cpu.wram[addr] = data;
}

SNESJS.CPU.prototype.enable = function() {
	snes.bus.map
}

SNESJS.CPU.prototype.last_cycle = function() {
	if (status.irq_lock == false) {
		status.nmi_pending |= nmi_test();
		status.irq_pending |= irq_test();
		status.interrupt_pending = (status.nmi_pending || status.irq_pending);
	}
}


SNESJS.CPU.prototype.op_readpc = function() {
	// body...
}


/*
 * This file is part of SNESJS.
 *
 * SNESJS is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * SNESJS is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with SNESJS.  If not, see <http://www.gnu.org/licenses/>.
 */

SNESJS.CPU.ALU = function() {
	this.mpyctr = 0;
	this.divctr = 0;
	this.shift = 0;
}


/*
 * This file is part of SNESJS.
 *
 * SNESJS is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * SNESJS is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with SNESJS.  If not, see <http://www.gnu.org/licenses/>.
 */

SNESJS.CPU.prototype.initialize_opcode_table = function() {
	

	/*
	 * Register all ops!
	 */
	this.opEII(0x00, "interrupt", 0xfffe, 0xffe6);
	this.opMF(0x01, "read_idpx", "ora");
	this.opEII(0x02, "interrupt", 0xfff4, 0xffe4);
	this.opMF(0x03, "read_sr", "ora");
	this.opMF(0x04, "adjust_dp", "tsb");
	this.opMF(0x05, "read_dp", "ora");
	this.opMF(0x06, "adjust_dp", "asl");
	this.opMF(0x07, "read_ildp", "ora");
	this.opA(0x08, "php");
	this.opMF(0x09, "read_const", "ora");
	this.opM(0x0a, "asl_imm");
	this.opE(0x0b, "phd");
	this.opMF(0x0c, "adjust_addr", "tsb");
	this.opMF(0x0d, "read_addr", "ora");
	this.opMF(0x0e, "adjust_addr", "asl");
	this.opMF(0x0f, "read_long", "ora");
	this.opAII(0x10, "branch", 0x80, 0x00);
	this.opMF(0x11, "read_idpy", "ora");
	this.opMF(0x12, "read_idp", "ora");
	this.opMF(0x13, "read_isry", "ora");
	this.opMF(0x14, "adjust_dp", "trb");
	this.opMFI(0x15, "read_dpr", "ora", OPCODE_X);
	this.opMF(0x16, "adjust_dpx", "asl");
	this.opMF(0x17, "read_ildpy", "ora");
	this.opAII(0x18, "flag", 0x01, 0x00);
	this.opMF(0x19, "read_addry", "ora");
	this.opMII(0x1a, "adjust_imm", OPCODE_A, 1);
	this.opE(0x1b, "tcs");
	this.opMF(0x1c, "adjust_addr", "trb");
	this.opMF(0x1d, "read_addrx", "ora");
	this.opMF(0x1e, "adjust_addrx", "asl");
	this.opMF(0x1f, "read_longx", "ora");
	this.opA(0x20, "jsr_addr");
	this.opMF(0x21, "read_idpx", "and");
	this.opE(0x22, "jsr_long");
	this.opMF(0x23, "read_sr", "and");
	this.opMF(0x24, "read_dp", "bit");
	this.opMF(0x25, "read_dp", "and");
	this.opMF(0x26, "adjust_dp", "rol");
	this.opMF(0x27, "read_ildp", "and");
	this.opE(0x28, "plp");
	this.opMF(0x29, "read_const", "and");
	this.opM(0x2a, "rol_imm");
	this.opE(0x2b, "pld");
	this.opMF(0x2c, "read_addr", "bit");
	this.opMF(0x2d, "read_addr", "and");
	this.opMF(0x2e, "adjust_addr", "rol");
	this.opMF(0x2f, "read_long", "and");
	this.opAII(0x30, "branch", 0x80, 1);
	this.opMF(0x31, "read_idpy", "and");
	this.opMF(0x32, "read_idp", "and");
	this.opMF(0x33, "read_isry", "and");
	this.opMFI(0x34, "read_dpr", "bit", OPCODE_X);
	this.opMFI(0x35, "read_dpr", "and", OPCODE_X);
	this.opMF(0x36, "adjust_dpx", "rol");
	this.opMF(0x37, "read_ildpy", "and");
	this.opAII(0x38, "flag", 0x01, 0x01);
	this.opMF(0x39, "read_addry", "and");
	this.opMII(0x3a, "adjust_imm", OPCODE_A, -1);
	this.opAII(0x3b, "transfer_w", OPCODE_S, OPCODE_A);
	this.opMF(0x3c, "read_addrx", "bit");
	this.opMF(0x3d, "read_addrx", "and");
	this.opMF(0x3e, "adjust_addrx", "rol");
	this.opMF(0x3f, "read_longx", "and");
	this.opE(0x40, "rti");
	this.opMF(0x41, "read_idpx", "eor");
	this.opA(0x42, "wdm");
	this.opMF(0x43, "read_sr", "eor");
	this.opXI(0x44, "move", -1);
	this.opMF(0x45, "read_dp", "eor");
	this.opMF(0x46, "adjust_dp", "lsr");
	this.opMF(0x47, "read_ildp", "eor");
	this.opMI(0x48, "push", OPCODE_A);
	this.opMF(0x49, "read_const", "eor");
	this.opM(0x4a, "lsr_imm");
	this.opA(0x4b, "phk");
	this.opA(0x4c, "jmp_addr");
	this.opMF(0x4d, "read_addr", "eor");
	this.opMF(0x4e, "adjust_addr", "lsr");
	this.opMF(0x4f, "read_long", "eor");
	this.opAII(0x50, "branch", 0x40, 0);
	this.opMF(0x51, "read_idpy", "eor");
	this.opMF(0x52, "read_idp", "eor");
	this.opMF(0x53, "read_isry", "eor");
	this.opXI(0x54, "move", +1);
	this.opMFI(0x55, "read_dpr", "eor", OPCODE_X);
	this.opMF(0x56, "adjust_dpx", "lsr");
	this.opMF(0x57, "read_ildpy", "eor");
	this.opAII(0x58, "flag", 0x04, 0x00);
	this.opMF(0x59, "read_addry", "eor");
	this.opXI(0x5a, "push", OPCODE_Y);
	this.opAII(0x5b, "transfer_w", OPCODE_A, OPCODE_D);
	this.opA(0x5c, "jmp_long");
	this.opMF(0x5d, "read_addrx", "eor");
	this.opMF(0x5e, "adjust_addrx", "lsr");
	this.opMF(0x5f, "read_longx", "eor");
	this.opA(0x60, "rts");
	this.opMF(0x61, "read_idpx", "adc");
	this.opE(0x62, "per");
	this.opMF(0x63, "read_sr", "adc");
	this.opMI(0x64, "write_dp", OPCODE_Z);
	this.opMF(0x65, "read_dp", "adc");
	this.opMF(0x66, "adjust_dp", "ror");
	this.opMF(0x67, "read_ildp", "adc");
	this.opMI(0x68, "pull", OPCODE_A);
	this.opMF(0x69, "read_const", "adc");
	this.opM(0x6a, "ror_imm");
	this.opE(0x6b, "rtl");
	this.opA(0x6c, "jmp_iaddr");
	this.opMF(0x6d, "read_addr", "adc");
	this.opMF(0x6e, "adjust_addr", "ror");
	this.opMF(0x6f, "read_long", "adc");
	this.opAII(0x70, "branch", 0x40, 1);
	this.opMF(0x71, "read_idpy", "adc");
	this.opMF(0x72, "read_idp", "adc");
	this.opMF(0x73, "read_isry", "adc");
	this.opMII(0x74, "write_dpr", OPCODE_Z, OPCODE_X);
	this.opMFI(0x75, "read_dpr", "adc", OPCODE_X);
	this.opMF(0x76, "adjust_dpx", "ror");
	this.opMF(0x77, "read_ildpy", "adc");
	this.opAII(0x78, "flag", 0x04, 0x04);
	this.opMF(0x79, "read_addry", "adc");
	this.opXI(0x7a, "pull", OPCODE_Y);
	this.opAII(0x7b, "transfer_w", OPCODE_D, OPCODE_A);
	this.opA(0x7c, "jmp_iaddrx");
	this.opMF(0x7d, "read_addrx", "adc");
	this.opMF(0x7e, "adjust_addrx", "ror");
	this.opMF(0x7f, "read_longx", "adc");
	this.opA(0x80, "bra");
	this.opM(0x81, "sta_idpx");
	this.opA(0x82, "brl");
	this.opM(0x83, "sta_sr");
	this.opXI(0x84, "write_dp", OPCODE_Y);
	this.opMI(0x85, "write_dp", OPCODE_A);
	this.opXI(0x86, "write_dp", OPCODE_X);
	this.opM(0x87, "sta_ildp");
	this.opXII(0x88, "adjust_imm", OPCODE_Y, -1);
	this.opM(0x89, "read_bit_const");
	this.opMII(0x8a, "transfer", OPCODE_X, OPCODE_A);
	this.opA(0x8b, "phb");
	this.opXI(0x8c, "write_addr", OPCODE_Y);
	this.opMI(0x8d, "write_addr", OPCODE_A);
	this.opXI(0x8e, "write_addr", OPCODE_X);
	this.opMI(0x8f, "write_longr", OPCODE_Z);
	this.opAII(0x90, "branch", 0x01, 0);
	this.opM(0x91, "sta_idpy");
	this.opM(0x92, "sta_idp");
	this.opM(0x93, "sta_isry");
	this.opXII(0x94, "write_dpr", OPCODE_Y, OPCODE_X);
	this.opMII(0x95, "write_dpr", OPCODE_A, OPCODE_X);
	this.opXII(0x96, "write_dpr", OPCODE_X, OPCODE_Y);
	this.opM(0x97, "sta_ildpy");
	this.opMII(0x98, "transfer", OPCODE_Y, OPCODE_A);
	this.opMII(0x99, "write_addrr", OPCODE_A, OPCODE_Y);
	this.opE(0x9a, "txs");
	this.opXII(0x9b, "transfer", OPCODE_X, OPCODE_Y);
	this.opMI(0x9c, "write_addr", OPCODE_Z);
	this.opMII(0x9d, "write_addrr", OPCODE_A, OPCODE_X);
	this.opMII(0x9e, "write_addrr", OPCODE_Z, OPCODE_X);
	this.opMI(0x9f, "write_longr", OPCODE_X);
	this.opXF(0xa0, "read_const", "ldy");
	this.opMF(0xa1, "read_idpx", "lda");
	this.opXF(0xa2, "read_const", "ldx");
	this.opMF(0xa3, "read_sr", "lda");
	this.opXF(0xa4, "read_dp", "ldy");
	this.opMF(0xa5, "read_dp", "lda");
	this.opXF(0xa6, "read_dp", "ldx");
	this.opMF(0xa7, "read_ildp", "lda");
	this.opXII(0xa8, "transfer", OPCODE_A, OPCODE_Y);
	this.opMF(0xa9, "read_const", "lda");
	this.opXII(0xaa, "transfer", OPCODE_A, OPCODE_X);
	this.opA(0xab, "plb");
	this.opXF(0xac, "read_addr", "ldy");
	this.opMF(0xad, "read_addr", "lda");
	this.opXF(0xae, "read_addr", "ldx");
	this.opMF(0xaf, "read_long", "lda");
	this.opAII(0xb0, "branch", 0x01, 1);
	this.opMF(0xb1, "read_idpy", "lda");
	this.opMF(0xb2, "read_idp", "lda");
	this.opMF(0xb3, "read_isry", "lda");
	this.opXFI(0xb4, "read_dpr", "ldy", OPCODE_X);
	this.opMFI(0xb5, "read_dpr", "lda", OPCODE_X);
	this.opXFI(0xb6, "read_dpr", "ldx", OPCODE_Y);
	this.opMF(0xb7, "read_ildpy", "lda");
	this.opAII(0xb8, "flag", 0x40, 0x00);
	this.opMF(0xb9, "read_addry", "lda");
	this.opX(0xba, "tsx");
	this.opXII(0xbb, "transfer", OPCODE_Y, OPCODE_X);
	this.opXF(0xbc, "read_addrx", "ldy");
	this.opMF(0xbd, "read_addrx", "lda");
	this.opXF(0xbe, "read_addry", "ldx");
	this.opMF(0xbf, "read_longx", "lda");
	this.opXF(0xc0, "read_const", "cpy");
	this.opMF(0xc1, "read_idpx", "cmp");
	this.opEI(0xc2, "pflag", 0);
	this.opMF(0xc3, "read_sr", "cmp");
	this.opXF(0xc4, "read_dp", "cpy");
	this.opMF(0xc5, "read_dp", "cmp");
	this.opMF(0xc6, "adjust_dp", "dec");
	this.opMF(0xc7, "read_ildp", "cmp");
	this.opXII(0xc8, "adjust_imm", OPCODE_Y, +1);
	this.opMF(0xc9, "read_const", "cmp");
	this.opXII(0xca, "adjust_imm", OPCODE_X, -1);
	this.opA(0xcb, "wai");
	this.opXF(0xcc, "read_addr", "cpy");
	this.opMF(0xcd, "read_addr", "cmp");
	this.opMF(0xce, "adjust_addr", "dec");
	this.opMF(0xcf, "read_long", "cmp");
	this.opAII(0xd0, "branch", 0x02, 0);
	this.opMF(0xd1, "read_idpy", "cmp");
	this.opMF(0xd2, "read_idp", "cmp");
	this.opMF(0xd3, "read_isry", "cmp");
	this.opE(0xd4, "pei");
	this.opMFI(0xd5, "read_dpr", "cmp", OPCODE_X);
	this.opMF(0xd6, "adjust_dpx", "dec");
	this.opMF(0xd7, "read_ildpy", "cmp");
	this.opAII(0xd8, "flag", 0x08, 0x00);
	this.opMF(0xd9, "read_addry", "cmp");
	this.opXI(0xda, "push", OPCODE_X);
	this.opA(0xdb, "stp");
	this.opA(0xdc, "jmp_iladdr");
	this.opMF(0xdd, "read_addrx", "cmp");
	this.opMF(0xde, "adjust_addrx", "dec");
	this.opMF(0xdf, "read_longx", "cmp");
	this.opXF(0xe0, "read_const", "cpx");
	this.opMF(0xe1, "read_idpx", "sbc");
	this.opEI(0xe2, "pflag", 1);
	this.opMF(0xe3, "read_sr", "sbc");
	this.opXF(0xe4, "read_dp", "cpx");
	this.opMF(0xe5, "read_dp", "sbc");
	this.opMF(0xe6, "adjust_dp", "inc");
	this.opMF(0xe7, "read_ildp", "sbc");
	this.opXII(0xe8, "adjust_imm", OPCODE_X, +1);
	this.opMF(0xe9, "read_const", "sbc");
	this.opA(0xea, "nop");
	this.opA(0xeb, "xba");
	this.opXF(0xec, "read_addr", "cpx");
	this.opMF(0xed, "read_addr", "sbc");
	this.opMF(0xee, "adjust_addr", "inc");
	this.opMF(0xef, "read_long", "sbc");
	this.opAII(0xf0, "branch", 0x02, 1);
	this.opMF(0xf1, "read_idpy", "sbc");
	this.opMF(0xf2, "read_idp", "sbc");
	this.opMF(0xf3, "read_isry", "sbc");
	this.opE(0xf4, "pea");
	this.opMFI(0xf5, "read_dpr", "sbc", OPCODE_X);
	this.opMF(0xf6, "adjust_dpx", "inc");
	this.opMF(0xf7, "read_ildpy", "sbc");
	this.opAII(0xf8, "flag", 0x08, 0x08);
	this.opMF(0xf9, "read_addry", "sbc");
	this.opXI(0xfa, "pull", OPCODE_X);
	this.opA(0xfb, "xce");
	this.opE(0xfc, "jsr_iaddrx");
	this.opMF(0xfd, "read_addrx", "sbc");
	this.opMF(0xfe, "adjust_addrx", "inc");
	this.opMF(0xff, "read_longx", "sbc");
}

SNESJS.CPU.prototype.optable = [];

/*
 * Op registration helpers
 */

//All modes
SNESJS.CPU.prototype.opA = function(id, name) {
	var cpu = this;
	var func1 = getFunctionByName("SNESJS.CPU.OPS." + name);

    this.optable[TBL_EM + id] = 
    this.optable[TBL_MX + id] = 
    this.optable[TBL_Mx + id] = 
    this.optable[TBL_mX + id] = 
    this.optable[TBL_mx + id] = 
    function() { func1(cpu); };
}

//All modes, 2 args
SNESJS.CPU.prototype.opAII = function(id, name, x, y) {
	var cpu = this;
	var func1 = getFunctionByName("SNESJS.CPU.OPS." + name);

    this.optable[TBL_EM + id] = 
    this.optable[TBL_MX + id] = 
    this.optable[TBL_Mx + id] = 
    this.optable[TBL_mX + id] = 
    this.optable[TBL_mx + id] = 
    function() { func1(cpu, x, y); };
}

//Different on emulation mode
SNESJS.CPU.prototype.opE = function(id, name) {
	var cpu = this;
	var func1 = getFunctionByName("SNESJS.CPU.OPS." + name + "_e");

    this.optable[TBL_EM + id] = 
    function() { func1(cpu); };

    var func2 = getFunctionByName("SNESJS.CPU.OPS." + name + "_n");

    this.optable[TBL_MX + id] = 
    this.optable[TBL_Mx + id] = 
    this.optable[TBL_mX + id] = 
    this.optable[TBL_mx + id] = 
    function() { func2(cpu); };
}

//Different on emulation mode, 1 arg
SNESJS.CPU.prototype.opEI = function(id, name, x) {
	var cpu = this;
	var func1 = getFunctionByName("SNESJS.CPU.OPS." + name + "_e");

    this.optable[TBL_EM + id] = 
    function() { func1(cpu, x); };
    
    var func2 = getFunctionByName("SNESJS.CPU.OPS." + name + "_n");

    this.optable[TBL_MX + id] = 
    this.optable[TBL_Mx + id] = 
    this.optable[TBL_mX + id] = 
    this.optable[TBL_mx + id] = 
    function() { func2(cpu, x); };
}

//Different on emulation mode, 2 args
SNESJS.CPU.prototype.opEII = function(id, name, x, y) {
	var cpu = this;
	var func1 = getFunctionByName("SNESJS.CPU.OPS." + name + "_e");

    this.optable[TBL_EM + id] = 
    function() { func1(cpu, x, y); };

    var func2 = getFunctionByName("SNESJS.CPU.OPS." + name + "_n");

    this.optable[TBL_MX + id] = 
    this.optable[TBL_Mx + id] = 
    this.optable[TBL_mX + id] = 
    this.optable[TBL_mx + id] =
    function() { func2(cpu, x, y); };
}

//Different on memory mode
SNESJS.CPU.prototype.opM = function(id, name) {
	var cpu = this;
	var func1 = getFunctionByName("SNESJS.CPU.OPS." + name + "_b");

    this.optable[TBL_EM + id] = 
    this.optable[TBL_MX + id] = 
    this.optable[TBL_Mx + id] = 
    function() { func1(cpu); };

    var func2 = getFunctionByName("SNESJS.CPU.OPS." + name + "_w");

    this.optable[TBL_mX + id] = 
    this.optable[TBL_mx + id] =
    function() { func2(cpu); };
}

//Different on memory mode, 1 arg
SNESJS.CPU.prototype.opMI = function(id, name, x) {
	var cpu = this;
	var func1 = getFunctionByName("SNESJS.CPU.OPS." + name + "_b");

    this.optable[TBL_EM + id] = 
    this.optable[TBL_MX + id] = 
    this.optable[TBL_Mx + id] =
    function() { func1(cpu, x); };

    var func2 = getFunctionByName("SNESJS.CPU.OPS." + name + "_w");

    this.optable[TBL_mX + id] = 
    this.optable[TBL_mx + id] =
    function() { func2(cpu, x); };
}

//Different on memory mode, 2 args
SNESJS.CPU.prototype.opMII = function(id, name, x, y) {
	var cpu = this;
	var func1 = getFunctionByName("SNESJS.CPU.OPS." + name + "_b");

    this.optable[TBL_EM + id] = 
    this.optable[TBL_MX + id] = 
    this.optable[TBL_Mx + id] = 
    function() { func1(cpu, x, y); };

    var func2 = getFunctionByName("SNESJS.CPU.OPS." + name + "_w");

    this.optable[TBL_mX + id] = 
    this.optable[TBL_mx + id] =
    function() { func2(cpu, x, y); };
}

//Different on memory mode, accepts a function
SNESJS.CPU.prototype.opMF = function(id, name, fn) {
	var cpu = this;
	var func1 = getFunctionByName("SNESJS.CPU.OPS." + name + "_b");
	var func1_a = getFunctionByName("SNESJS.CPU.OPS." + fn + "_b");

    this.optable[TBL_EM + id] = 
    this.optable[TBL_MX + id] = 
    this.optable[TBL_Mx + id] = 
    function() { func1(cpu, func1_a); };

    var func2 = getFunctionByName("SNESJS.CPU.OPS." + name + "_w");
    var func2_a = getFunctionByName("SNESJS.CPU.OPS." + fn + "_w");

    this.optable[TBL_mX + id] = 
    this.optable[TBL_mx + id] = 
    function() { func2(cpu, func2_a); };
}

//Different on memory mode, accepts a function, 1 arg
SNESJS.CPU.prototype.opMFI = function(id, name, fn, x) {
	var cpu = this;
	var func1 = getFunctionByName("SNESJS.CPU.OPS." + name + "_b");
	var func1_a = getFunctionByName("SNESJS.CPU.OPS." + fn + "_b");

    this.optable[TBL_EM + id] = 
    this.optable[TBL_MX + id] = 
    this.optable[TBL_Mx + id] = 
    function() { func1(cpu, func1_a, x); };

    var func2 = getFunctionByName("SNESJS.CPU.OPS." + name + "_w");
    var func2_a = getFunctionByName("SNESJS.CPU.OPS." + fn + "_w");

    this.optable[TBL_mX + id] = 
    this.optable[TBL_mx + id] = 
    function() { func2(cpu, func2_a, x); };
}

//Different on register width
SNESJS.CPU.prototype.opX = function(id, name) {
	var cpu = this;
	var func1 = getFunctionByName("SNESJS.CPU.OPS." + name + "_b");

    this.optable[TBL_EM + id] = 
    this.optable[TBL_MX + id] = 
    this.optable[TBL_mX + id] = 
    function() { func1(cpu); };

    var func2 = getFunctionByName("SNESJS.CPU.OPS." + name + "_w");

    this.optable[TBL_Mx + id] = 
    this.optable[TBL_mx + id] = 
    function() { func2(cpu); };
}

//Different on register width, 1 arg
SNESJS.CPU.prototype.opXI = function(id, name, x) {
	var cpu = this;
	var func1 = getFunctionByName("SNESJS.CPU.OPS." + name + "_b");

    this.optable[TBL_EM + id] = 
    this.optable[TBL_MX + id] = 
    this.optable[TBL_mX + id] = 
    function() { func1(cpu, x); };

    var func2 = getFunctionByName("SNESJS.CPU.OPS." + name + "_w");

    this.optable[TBL_Mx + id] = 
    this.optable[TBL_mx + id] = 
    function() { func2(cpu, x); };
}

SNESJS.CPU.prototype.opXII = function(id, name, x, y) {
	var cpu = this;
	var func1 = getFunctionByName("SNESJS.CPU.OPS." + name + "_b");

    this.optable[TBL_EM + id] = 
    this.optable[TBL_MX + id] = 
    this.optable[TBL_mX + id] = 
    function() { func1(cpu, x, y); };

    var func2 = getFunctionByName("SNESJS.CPU.OPS." + name + "_w");

    this.optable[TBL_Mx + id] = 
    this.optable[TBL_mx + id] = 
    function() { func2(cpu, x, y); };
}

//Different on register width, accepts a function
SNESJS.CPU.prototype.opXF = function(id, name, fn) {
	var cpu = this;
	var func1 = getFunctionByName("SNESJS.CPU.OPS." + name + "_b");
	var func1_a = getFunctionByName("SNESJS.CPU.OPS." + fn);

    this.optable[TBL_EM + id] = 
    this.optable[TBL_MX + id] = 
    this.optable[TBL_mX + id] = 
    function() { func1(cpu, func1_a); };

    var func2 = getFunctionByName("SNESJS.CPU.OPS." + name + "_w");
    var func2_a = getFunctionByName("SNESJS.CPU.OPS." + fn);

    this.optable[TBL_Mx + id] = 
    this.optable[TBL_mx + id] = 
    function() { func2(cpu, func2_a); };
}

//Different on register width, accepts a function, 1 arg
SNESJS.CPU.prototype.opXFI = function(id, name, fn, x) {
	var cpu = this;
	var func1 = getFunctionByName("SNESJS.CPU.OPS." + name + "_b");
	var func1_a = getFunctionByName("SNESJS.CPU.OPS." + fn);

    this.optable[TBL_EM + id] = 
    this.optable[TBL_MX + id] = 
    this.optable[TBL_mX + id] = 
    function() { func1(cpu, func1_a, x); };

    var func2 = getFunctionByName("SNESJS.CPU.OPS." + name + "_w");
    var func2_a = getFunctionByName("SNESJS.CPU.OPS." + fn);

    this.optable[TBL_Mx + id] = 
    this.optable[TBL_mx + id] = 
    function() { func2(cpu, func2_a, x); };
}

SNESJS.CPU.OPS = {

	branch: function(cpu, bit, val) {
		if ((cpu.regs.p & bit) != val) {
			cpu.last_cycle();
			cpu.rd.l = cpu.op_readpc();
		} else {
			cpu.rd.l = cpu.op_readpc();
			cpu.aa.w = cpu.regs.pc.d + cpu.rd.l;
			cpu.op_io_cond6(cpu.aa.w);
			cpu.last_cycle();
			cpu.op_io();
			cpu.regs.pc.w = cpu.aa.w;
		}
	},

	bra: function(cpu) {
		cpu.rd.l = cpu.op_readpc();
		cpu.aa.w = cpu.regs.pc.d + cpu.rd.l;
		cpu.op_io_cond6(aa.w);
		cpu.last_cycle();
		cpu.op_io();
		cpu.regs.pc.w = cpu.aa.w;
	},

	brl: function(cpu) {
		cpu.rd.l = cpu.op_readpc();
		cpu.rd.h = cpu.op.readpc();
		cpu.last_cycle();
		cpu.op_io();
		cpu.regs.pc.w = cpu.regs.pc.d + cpu.rd.w;
	},

	jmp_addr: function(cpu) {
		cpu.rd.l = cpu.op_readpc();
		cpu.last_cycle();
		cpu.rd.h = cpu.op_readpc();
		cpu.regs.pc.w = cpu.rd.w;
	},

	jmp_long: function(cpu) {
		cpu.rd.l = cpu.op_readpc();
		cpu.rd.h = cpu.op_readpc();
		cpu.last_cycle();
		cpu.rd.b = cpu.op_readpc();
		cpu.regs.pc.d = cpu.rd.d & 0xffffff;
	},

	jmp_iaddr: function(cpu) {
        cpu.aa.l = cpu.op_readpc();
        cpu.aa.h = cpu.op_readpc();
        cpu.rd.l = cpu.op_readaddr(aa.w + 0);
        cpu.last_cycle();
        cpu.rd.h = cpu.op_readaddr(aa.w + 1);
        cpu.regs.pc.w = cpu.rd.w;
	},

	jmp_iaddrx: function(cpu) {
        cpu.aa.l = cpu.op_readpc();
        cpu.aa.h = cpu.op_readpc();
        cpu.op_io();
        cpu.rd.l = cpu.op_readpbr((uint)(aa.w + regs.x.w + 0));
        cpu.last_cycle();
        cpu.rd.h = cpu.op_readpbr((uint)(aa.w + regs.x.w + 1));
        cpu.regs.pc.w = cpu.rd.w;
	},

	jmp_iladdr: function(cpu) {
		cpu.aa.l = cpu.op_readpc();
		cpu.aa.h = cpu.op_readpc();
		cpu.rd.l = cpu.op_readaddr(cpu.aa.w + 0);
		cpu.rd.h = cpu.op_readaddr(cpu.aa.w + 1);
		cpu.last_cycle();
		cpu.rd.b = cpu.op_readaddr(cpu.aa.w + 2);
		cpu.regs.pc.d = cpu.rd.d & 0xffffff;
	},

	jsr_addr: function(cpu) {
		cpu.aa.l = cpu.op_readpc();
		cpu.aa.h = cpu.op_readpc();
		cpu.op_io();
		cpu.regs.pc.w--;
		cpu.op_writestack(cpu.regs.pc.h);
		cpu.last_cycle();
		cpu.op_writestack(cpu.regs.pc.l);
		cpu.regs.pc.w = cpu.aa.w;
	},

	jsr_long_e: function(cpu) {

	},

	jsr_long_n: function(cpu) {

	},

	jsr_iaddrx_e: function(cpu) {

	},

	jsr_iaddrx_n: function(cpu) {

	},

	rti_e: function(cpu) {

	},

	rti_n: function(cpu) {

	},

	rts: function(cpu) {

	},

	rtl_e: function(cpu) {

	},

	rtl_n: function(cpu) {

	},

	nop: function(cpu) {
		cpu.last_cycle();
		cpu.op_io_irq();		
	},

	wdm: function(cpu) {
		cpu.last_cycle();
		cpu.op_readpc();
	},

	xba: function(cpu) {
		cpu.op_io();
		cpu.last_cycle();
		cpu.op_io();
		cpu.regs.a.l ^= cpu.regs.a.h;
		cpu.regs.a.h ^= cpu.regs.a.l;
		cpu.regs.a.l ^= cpu.regs.a.h;
		cpu.regs.p.n = (cpu.regs.a.l & 0x80) == 0x80;
		cpu.regs.p.z = (cpu.regs.a.l == 0);
	},

	move_b: function(cpu, adjust) {
		cpu.dp = cpu.op_readpc();
		cpu.sp = cpu.op_readpc();
		cpu.regs.db = cpu.dp;
		cpu.rd.l = cpu.op_readlong((cpu.sp << 16) | cpu.regs.x.w);
		cpu.op_writelong(((cpu.dp << 16) | cpu.regs.y.w), cpu.rd.l);
		cpu.op_io();
		cpu.regs.x.l += adjust;
		cpu.regs.y.l += adjust;
		cpu.last_cycle();
		cpu.op_io();
		if (cpu.regs.a.w-- == 0x01) {
			cpu.regs.pc.w -= 3;
		}
	},

	move_w: function(cpu, adjust) {
		cpu.dp = cpu.op_readpc();
		cpu.sp = cpu.op_readpc();
		cpu.regs.db = cpu.dp;
		cpu.rd.l = cpu.op_readlong((cpu.sp << 16) | cpu.regs.x.w);
		cpu.op_writelong((cpu.dp << 16) | cpu.regs.y.w, cpu.rd.l);
		cpu.op_io();
		cpu.regs.x.w += cpu.adjust;
		cpu.regs.y.w += cpu.adjust;
		cpu.last_cycle();
		cpu.op_io();
		if (regs.a.w-- == 0x01) {
			regs.pc.w -= 3;
		}
	},

	interrupt_e: function(cpu, vectorE, vectorN) {
		cpu.op_readpc();
		cpu.op_writestack(cpu.regs.pc.h);
		cpu.op_writestack(cpu.regs.pc.l);
		cpu.op_writestack(cpu.regs.p);
		cpu.rd.l = cpu.op_readlong(vectorE + 0);
		cpu.regs.pc.b = 0x00;
		cpu.regs.p.i = true;
		cpu.regs.p.d = false;
		cpu.last_cycle();
		cpu.rd.h = cpu.op_readlong(vectorE + 1);
		cpu.regs.pc.w = rd.w;
	},

	interrupt_n: function(cpu, vectorE, vectorN) {
		cpu.op_readpc();
		cpu.op_writestack(cpu.regs.pc.h);
		cpu.op_writestack(cpu.regs.pc.l);
		cpu.op_writestack(cpu.regs.p);
		op_writestack(regs.p);
		cpu.rd.l = cpu.op_readlong(vectorN + 0);
		cpu.regs.pc.b = 0x00;
		cpu.regs.p.i = true;
		cpu.regs.p.d = false;
		cpu.last_cycle();
		cpu.rd.h = cpu.op_readlong(vectorN + 1);
		cpu.regs.pc.w = rd.w;
	},

	stp: function(cpu) {
		cpu.regs.wai = true;
		while (cpu.regs.wai) {
			cpu.last_cycle();
			cpu.op_io();
		}
	},

	wai: function(cpu) {
		cpu.regs.wai = true;
		while (cpu.regs.wai) {
			cpu.last_cycle();
			cpu.op_io();
		}
		cpu.op_io();
	},

	xce: function(cpu) {
		cpu.last_cycle();
		cpu.op_io_irq();
		var carry = cpu.regs.p.c; //Switch c with e
		cpu.regs.p.c = cpu.regs.e;
		cpu.regs.e = carry;
		if (cpu.regs.e) {
			cpu.regs.p.assign(cpu.regs.p | 0x30);
			cpu.regs.s.h = 0x01;
		}
		if (cpu.regs.p.x) {
			cpu.regs.x.h = 0x00;
			cpu.regs.y.h = 0x00;
		}
		cpu.update_table();
	},

	flag: function(cpu, mask, value) {
		cpu.last_cycle();
		cpu.op_io_irq();
		cpu.regs.p.assign((regs.p & ~mask) | value);
	},

	pflag_e: function(cpu, mode) {
		cpu.rd.l = cpu.op_readpc();
		cpu.last_cycle();
		cpu.op_io();
		cpu.regs.p.assign((mode == 0x1) ? cpu.regs.p | cpu.rd.l : cpu.regs.p & ~rd.l);
		cpu.regs.p.assign(cpu.regs.p | 0x30);
		if (cpu.regs.p.x) {
			cpu.regs.x.h = 0x00;
			cpu.regs.y.h = 0x00;
		}
		cpu.update_table();
	},

	pflag_n: function(cpu, mode) {
		cpu.rd.l = cpu.op_readpc();
		cpu.last_cycle();
		cpu.op_io();
		cpu.regs.p.assign((mode == 0x1) ? cpu.regs.p | cpu.rd.l : cpu.regs.p & ~rd.l);
		if (cpu.regs.p.x) {
			cpu.regs.x.h = 0x00;
			cpu.regs.y.h = 0x00;
		}
		cpu.update_table();
	},

	transfer_b: function(cpu, from, to) {
		cpu.last_cycle();
		cpu.op_io_irq();
		cpu.regs.r[to].l = cpu.regs.r[from].l;
		cpu.regs.p.n = (cpu.regs.r[to].l & 0x80) == 0x80;
		cpu.regs.p.z = (cpu.regs.r[to].l == 0);
	},

	transfer_w: function(cpu, from, to) {
		cpu.last_cycle();
		cpu.op_io_irq();
		cpu.regs.r[to].w = cpu.regs.r[from].w;
		cpu.regs.p.n = (regs.r[to].w & 0x8000) == 0x8000;
		cpu.regs.p.z = regs.r[to].w == 0;
	},

	tcs_e: function(cpu) {
		cpu.last_cycle();
		cpu.op_io_irq();
		cpu.regs.s.l = cpu.regs.a.l;
	},

	tcs_n: function(cpu) {
		cpu.last_cycle();
		cpu.op_io_irq();
		cpu.regs.s.w = cpu.regs.a.w;
	},

	tsx_b: function(cpu) {
		cpu.last_cycle();
		cpu.op_io_irq();
		cpu.regs.x.l = cpu.regs.s.l;
		cpu.regs.p.n = (cpu.regs.x.l & 0x80) == 0x80;
		cpu.regs.p.z = cpu.regs.x.l == 0;
	},

	tsx_w: function(cpu) {
		cpu.last_cycle();
		cpu.op_io_irq();
		cpu.regs.x.w = cpu.regs.s.w;
		cpu.regs.p.n = (cpu.regs.x.w & 0x8000) == 0x8000;
		cpu.regs.p.z = cpu.regs.x.w == 0;
	},

	txs_e: function(cpu) {
		cpu.last_cycle();
		cpu.op_io_irq();
		cpu.regs.s.l = cpu.regs.x.l;
	},

	txs_n: function(cpu) {
		cpu.last_cycle();
		cpu.op_io_irq();
		cpu.regs.s.w = cpu.regs.x.w;
	},

	push_b: function(cpu, n) {
		cpu.op_io();
		cpu.last_cycle();
		cpu.op_writestack(cpu.regs.r[n].l);
	},

	push_w: function(cpu, n) {
		cpu.op_io();
		cpu.op_writestack(regs.r[n].h);
		cpu.last_cycle();
		cpu.op_writestack(regs.r[n].l);
	},

	phd_e: function(cpu) {
		cpu.op_io();
		cpu.op_writestackn(cpu.regs.d.h);
		cpu.last_cycle();
		cpu.op_writestackn(cpu.regs.d.l);
		cpu.regs.s.h = 0x01;
	},

	phd_n: function(cpu) {
		cpu.op_io();
		cpu.op_writestackn(cpu.regs.d.h);
		cpu.last_cycle();
		cpu.op_writestackn(cpu.regs.d.l);
	}

};


/*
 * This file is part of SNESJS.
 *
 * SNESJS is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * SNESJS is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with SNESJS.  If not, see <http://www.gnu.org/licenses/>.
 */

SNESJS.CPU.prototype.mmio_read = function(addr) {
    if ((addr & 0xffc0) == 0x2140) {
        synchronize_smp();
        return this.snes.smp.port_read(new uint2(addr & 3));
    }

    switch (addr & 0xffff) {
        case 0x2180:
            var result = this.snes.bus.read(0x7e0000 | cpu_status_wram_addr);
            cpu_status_wram_addr = (cpu_status_wram_addr + 1) & 0x01ffff;
            return result;

        case 0x4016:
            var result = regs.mdr & 0xfc;
            result |= (Input.input.port_read(false) & 3);
            return result;

        case 0x4017:
            var result = (this.regs.mdr & 0xe0) | 0x1c;
            result |= (Input.input.port_read(true) & 3);
            return result;

        case 0x4210:
            var result = this.regs.mdr & 0x70;
            result |= (Convert.ToInt32(cpu_status_nmi_line) << 7);
            result |= 0x02;  //CPU revision
            cpu_status_nmi_line = false;
            return result;

        case 0x4211:
            var result = this.regs.mdr & 0x7f;
            result |= (cpu_status_irq_line ? 1 : 0) << 7;
            cpu_status_irq_line = false;
            return result;

        case 0x4212:
            var result = (this.regs.mdr & 0x3e);
            vbstart = this.snes.ppu.overscan() ? 240 : 225;

            if (this.snes.ppucounter.vcounter() >= vbstart && this.snes.ppucounter.vcounter() <= vbstart + 2) {
                result |= 0x01;
            }

            if (this.snes.ppucounter.hcounter() <= 2 || this.snes.ppucounter.hcounter() >= 1096) {
                result |= 0x40;
            }
            if (this.snes.ppucounter.vcounter() >= vbstart){
                result |= 0x80;
            }

            return result;

        case 0x4213:
            return cpu_status_pio;

        case 0x4214:
            return cpu_status_rddiv >> 0;

        case 0x4215:
            return cpu_status_rddiv >> 8;

        case 0x4216:
            return cpu_status_rdmpy >> 0;

        case 0x4217:
            return cpu_status_rdmpy >> 8;

        case 0x4218:
            return cpu_status_joy1l;

        case 0x4219:
            return cpu_status_joy1h;

        case 0x421a:
            return cpu_status_joy2l;

        case 0x421b:
            return cpu_status_joy2h;

        case 0x421c:
            return cpu_status_joy3l;

        case 0x421d:
            return cpu_status_joy3h;

        case 0x421e:
            return cpu_status_joy4l;

        case 0x421f:
            return cpu_status_joy4h;
    }

    if ((addr & 0xff80) == 0x4300) {
        i = (addr >> 4) & 7;
        switch (addr & 0xff8f) {
            case 0x4300:
                return ((channel[i].direction ? 1 : 0) << 7)
                | ((channel[i].indirect ? 1 : 0) << 6)
                | ((channel[i].unused ? 1 : 0) << 5)
                | ((channel[i].reverse_transfer ? 1 : 0) << 4)
                | ((channel[i].fixed_transfer ? 1 : 0) << 3)
                | (channel[i].transfer_mode << 0);

            case 0x4301:
                return channel[i].dest_addr;

            case 0x4302:
                return channel[i].source_addr >> 0;

            case 0x4303:
                return channel[i].source_addr >> 8;

            case 0x4304:
                return channel[i].source_bank;

            case 0x4305:
                return channel[i].union.transfer_size >> 0;

            case 0x4306:
                return channel[i].union.transfer_size >> 8;

            case 0x4307:
                return channel[i].indirect_bank;

            case 0x4308:
                return channel[i].hdma_addr >> 0;

            case 0x4309:
                return channel[i].hdma_addr >> 8;

            case 0x430a:
                return channel[i].line_counter;

            case 0x430b:
            case 0x430f:
                return channel[i].unknown;
        }
    }

    return this.regs.mdr;
}

SNESJS.CPU.prototype.mmio_write = function(addr, data) {
    if ((addr & 0xffc0) == 0x2140) {
        this.synchronize_smp();
        this.port_write((addr & 3), data);
        return;
    }

    switch (addr & 0xffff) {
        case 0x2180:
            this.snes.bus.write(new uint24(0x7e0000 | cpu_status_wram_addr), data);
            cpu_status_wram_addr = (cpu_status_wram_addr + 1) & 0x01ffff;
            return;

        case 0x2181:
            cpu_status_wram_addr = (cpu_status_wram_addr & 0x01ff00) | (data << 0);
            return;

        case 0x2182:
            cpu_status_wram_addr = (cpu_status_wram_addr & 0x0100ff) | (data << 8);
            return;

        case 0x2183:
            cpu_status_wram_addr = (cpu_status_wram_addr & 0x00ffff) | ((data & 1) << 16);
            return;

        case 0x4016:
            this.snes.input.port1.latch(data & 1);
            this.snes.input.port2.latch(data & 1);
            return;

        case 0x4200:
            var nmi_enabled = cpu_status_nmi_enabled;
            var virq_enabled = cpu_status_virq_enabled;
            var hirq_enabled = cpu_status_hirq_enabled;

            cpu_status_nmi_enabled = (data & 0x80) != 0;
            cpu_status_virq_enabled = (data & 0x20) != 0;
            cpu_status_hirq_enabled = (data & 0x10) != 0;
            cpu_status_auto_joypad_poll_enabled = (data & 0x01) != 0;

            if (!nmi_enabled && cpu_status_nmi_enabled && cpu_status_nmi_line) {
                cpu_status_nmi_transition = true;
            }

            if (cpu_status_virq_enabled && !cpu_status_hirq_enabled && cpu_status_irq_line) {
                cpu_status_irq_transition = true;
            }

            if (!cpu_status_virq_enabled && !cpu_status_hirq_enabled) {
                cpu_status_irq_line = false;
                cpu_status_irq_transition = false;
            }

            cpu_status_irq_lock = true;
            return;

        case 0x4201:
            if ((cpu_status_pio & 0x80) != 0 && (data & 0x80) == 0) {
                this.snes.ppu.latch_counters();
            }
            cpu_status_pio = data;

        case 0x4202:
            cpu_status_wrmpya = data;
            return;

        case 0x4203:
            cpu_status_wrmpyb = data;
            cpu_status_rdmpy = (cpu_status_wrmpya * cpu_status_wrmpyb);
            return;

        case 0x4204:
            cpu_status_wrdiva = ((cpu_status_wrdiva & 0xff00) | (data << 0));
            return;

        case 0x4205:
            cpu_status_wrdiva = ((data << 8) | (cpu_status_wrdiva & 0x00ff));
            return;

        case 0x4206:
            cpu_status_wrdivb = data;
            cpu_status_rddiv = ((cpu_status_wrdivb != 0) ? cpu_status_wrdiva / cpu_status_wrdivb : 0xffff);
            cpu_status_rdmpy = ((cpu_status_wrdivb != 0) ? cpu_status_wrdiva % cpu_status_wrdivb : cpu_status_wrdiva);
            return;

        case 0x4207:
            cpu_status_htime = ((cpu_status_htime & 0x0100) | (data << 0));
            return;

        case 0x4208:
            cpu_status_htime = (((data & 1) << 8) | (cpu_status_htime & 0x00ff));
            return;

        case 0x4209:
            cpu_status_vtime = ((cpu_status_vtime & 0x0100) | (data << 0));
            return;

        case 0x420a:
            cpu_status_vtime = (((data & 1) << 8) | (cpu_status_vtime & 0x00ff));
            return;

        case 0x420b:
            for (var i = 0; i < 8; i++) {
                channel[i].dma_enabled = (data & (1 << i)) != 0;
            }
            if (data != 0) {
                dma_run();
            }
            return;

        case 0x420c:
            for (var i = 0; i < 8; i++) {
                channel[i].hdma_enabled = (data & (1 << i)) != 0;
            }
            return;

        case 0x420d:
            cpu_status_rom_speed = (data & 1) != 0 ? 6 : 8;
            return;
    }

    if ((addr & 0xff80) == 0x4300) {
        var i = (addr >> 4) & 7;

        switch (addr & 0xff8f) {
            case 0x4300:
                channel[i].direction = (data & 0x80) != 0;
                channel[i].indirect = (data & 0x40) != 0;
                channel[i].unused = (data & 0x20) != 0;
                channel[i].reverse_transfer = (data & 0x10) != 0;
                channel[i].fixed_transfer = (data & 0x08) != 0;
                channel[i].transfer_mode = (data & 0x07);
                return;

            case 0x4301:
                channel[i].dest_addr = data;
                return;

            case 0x4302:
                channel[i].source_addr = ((channel[i].source_addr & 0xff00) | (data << 0));
                return;

            case 0x4303:
                channel[i].source_addr = ((data << 8) | (channel[i].source_addr & 0x00ff));
                return;

            case 0x4304:
                channel[i].source_bank = data;
                return;

            case 0x4305:
                channel[i].union.transfer_size = ((channel[i].union.transfer_size & 0xff00) | (data << 0));
                return;

            case 0x4306:
                channel[i].union.transfer_size = ((data << 8) | (channel[i].union.transfer_size & 0x00ff));
                return;

            case 0x4307:
                channel[i].indirect_bank = data;
                return;

            case 0x4308:
                channel[i].hdma_addr = ((channel[i].hdma_addr & 0xff00) | (data << 0));
                return;

            case 0x4309:
                channel[i].hdma_addr = ((data << 8) | (channel[i].hdma_addr & 0x00ff));
                return;

            case 0x430a:
                channel[i].line_counter = data;
                return;

            case 0x430b:
            case 0x430f:
                channel[i].unknown = data;
                return;
        }
    }
}


/*
 * This file is part of SNESJS.
 *
 * SNESJS is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * SNESJS is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with SNESJS.  If not, see <http://www.gnu.org/licenses/>.
 */

SNESJS.CPU.Regs = function() {
	this.pc = new SNESJS.CPU.Reg24();

	this.p = new SNESJS.CPU.RegFlag();

	var rtemp = [];

	this.a = rtemp[0] = new SNESJS.CPU.Reg16();
	this.x = rtemp[1] = new SNESJS.CPU.Reg16();
	this.y = rtemp[2] = new SNESJS.CPU.Reg16();
	this.z = rtemp[3] = new SNESJS.CPU.Reg16();
	this.s = rtemp[4] = new SNESJS.CPU.Reg16();
	this.d = rtemp[5] = new SNESJS.CPU.Reg16();

	this.r = rtemp;

	this.db = 0;
	this.e = false;
	this.irq = false; //IRQ pin (0 = low, 1 = trigger)
	this.wai = false; //Raised during wai, cleared after interrupt triggered
	this.mdr = 0; //Memory data register

	this.z.d = 0;
}

SNESJS.CPU.RegFlag = function() {
	this.n = false;
	this.v = false;
	this.m = false;
	this.x = false;
	this.d = false;
	this.i = false;
	this.z = false;
	this.c = false;
}

SNESJS.CPU.RegFlag.prototype.assign = function(data) {
	this.n = (data & 0x80) == 0x80;
	this.v = (data & 0x40) == 0x40;
	this.m = (data & 0x20) == 0x20;
	this.x = (data & 0x10) == 0x10;
	this.d = (data & 0x08) == 0x08;
	this.i = (data & 0x04) == 0x04;
	this.z = (data & 0x02) == 0x02;
	this.c = (data & 0x01) == 0x01;
}

SNESJS.CPU.RegFlag.prototype.valueOf = function() {
	return (this.n ? 0x80 : 0x00)
		| (this.v ? 0x40 : 0x00)
		| (this.m ? 0x20 : 0x00)
		| (this.x ? 0x10 : 0x00)
		| (this.d ? 0x08 : 0x00)
		| (this.i ? 0x04 : 0x00)
		| (this.z ? 0x02 : 0x00)
		| (this.c ? 0x01 : 0x00);
}

SNESJS.CPU.Reg16 = function() {
	this.w = 0; //Value

	this.l = 0;
	this.h = 0;
}

SNESJS.CPU.Reg24 = function() {
	this.d = 0; //Value

	this.w = 0;
	this.wh = 0;

	this.l = 0;
	this.h = 0;
	this.b = 0;
	this.bh = 0;
}


var cpu_status_nmi_valid = false;
var cpu_status_nmi_line = false;
var cpu_status_nmi_transition = false;
var cpu_status_nmi_pending = false;

var cpu_status_irq_valid = false;
var cpu_status_irq_line = false;
var cpu_status_irq_transition = false;
var cpu_status_irq_pending = false;

var cpu_status_irq_lock = false;
var cpu_status_hdma_pending = false;

var cpu_status_wram_addr = 0;

var cpu_status_joypad_strobe_latch = false;

var cpu_status_nmi_enabled = false;
var cpu_status_virq_enabled = false;
var cpu_status_hirq_enabled = false;
var cpu_status_auto_joypad_poll_enabled = false;

var cpu_status_pio = 0;

var cpu_status_wrmpya = 0;
var cpu_status_wrmpyb = 0;
var cpu_status_wrdiva = 0;
var cpu_status_wrdivb = 0;

var cpu_status_htime = 0;
var cpu_status_vtime = 0;

var cpu_status_rom_speed = 0;

var cpu_status_rddiv = 0;
var cpu_status_rdmpy = 0;

var cpu_status_joy1l = 0
var cpu_status_joy1h = 0;
var cpu_status_joy2l = 0
var cpu_status_joy2h = 0;
var cpu_status_joy3l = 0
var cpu_status_joy3h = 0;
var cpu_status_joy4l = 0
var cpu_status_joy4h = 0;


function uclip24(num) {
	return num & 0xffffff;
}

function uclip16(num) {
	return num & 0xffff;
}

function uclip8(num) {
	return num & 0xff;
}


//Code taken and modified from http://stackoverflow.com/questions/359788/how-to-execute-a-javascript-function-when-i-have-its-name-as-a-string
function getFunctionByName(functionName) {
	var context = window;
	var args = Array.prototype.slice.call(arguments).splice(2);
	var namespaces = functionName.split(".");
	var func = namespaces.pop();
	for(var i = 0; i < namespaces.length; i++) {
    	context = context[namespaces[i]];
	}
	return context[func];
}