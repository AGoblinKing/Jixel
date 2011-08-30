def('Jxl.TileMap', {
    extend: Jxl.Object,
    init: function(options) {
        this.prototype.supr.call(this, options);
    },
    auto: Jxl.TileMapOFF,
    collideIndex: 1,
    startingIndex: 0,
    drawIndex: 1,
    widthInTiles: 0,
    heightInTiles: 0,
    totalTiles: 0,
    _buffer: null,
    _bufferLoc: new Jxl.Point(),
    _flashRect2: new Jxl.Rect(),
    _flashRect: new Jxl.Rect(),
    _data: null,
    _tileWidth: 0,
    _tileHeight: 0,
    _rects: null,
    _pixels: null,
    _block: new Jxl.Object({
        width: 0,
        height: 0,
        fixed: true
    }),
    _callbacks: new Array(),
    fixed: true,
    loadMap: function(MapData, TileGraphic, TileWidth, TileHeight) {
        var c, cols, rows = MapData.split("\n");
        this.heightInTiles = rows.length;
        this._data = [];
        for (var r = 0; r < this.heightInTiles; r++) {
            cols = rows[r].split(",");
            if (cols.length <= 1) {
                this.heightInTiles--;
                continue;
            }
            if (this.widthInTiles == 0) this.widthInTiles = cols.length
            for (c = 0; c < this.widthInTiles; c++)
            this._data.push(cols[c]);
        }

        //Pre-Process the map data if its auto-tiled
        var i;
        this.totalTiles = this.widthInTiles * this.heightInTiles;
        if (this.auto > Jxl.TileMapOFF) {
            this.collideIndex = this.startingIndex = this.drawIndex = 1;
            i = 0;
            while (i < this.totalTiles)
            this.autoTile(i++);
        }

        this._pixels = TileGraphic;

        if (TileWidth == undefined) this._tileWidth = this._pixels.height;
        else this._tileWidth = TileWidth;
        if (TileHeight == undefined) this._tileHeight = this._tileWidth;
        else this._tileHeight = TileHeight;

        this._block.width = this._tileWidth;
        this._block.height = this._tileHeight;

        this.width = this.widthInTiles * this._tileWidth;
        this.height = this.heightInTiles * this._tileHeight;

        this._rects = new Array(this.totalTiles);
        for (i = 0; i < this.totalTiles; i++)
        this.updateTile(i);

        this._screenRows = Math.ceil(Jxl.height / this._tileHeight) + 1;
        if (this._screenRows > this.heightInTiles) this._screenRows = this.heightInTiles;
        this._screenCols = Math.ceil(Jxl.width / this._tileWidth) + 1;
        if (this._screenCols > this.widthInTiles) this._screenCols = this.widthInTiles;

        return this;
    },
    render: function() {
        this._point = this.getScreenXY(Jxl, this._point);
        var _flashPoint = new Jxl.Point({
            x: this._point.x,
            y: this._point.y
        });

        var tx = Math.floor(-this._point.x / this._tileWidth);
        var ty = Math.floor(-this._point.y / this._tileHeight);
        if (tx < 0) tx = 0;
        if (tx > this.widthInTiles - this._screenCols) tx = this.widthInTiles - this._screenCols;
        if (ty < 0) ty = 0;
        if (ty > this.heightInTiles - this._screenRows) ty = this.heightInTiles - this._screenRows;
        var ri = ty * this.widthInTiles + tx;
        _flashPoint.x += tx * this._tileWidth;
        _flashPoint.y += ty * this._tileHeight;
        var opx = _flashPoint.x;
        var c;
        var cri;
        for (var r = 0; r < this._screenRows; r++) {
            cri = ri;
            for (c = 0; c < this._screenCols; c++) {
                var _flashRect = this._rects[cri++];
                if (_flashRect != null) Jxl.buffer.drawImage(this._pixels, _flashRect[0], _flashRect[1], _flashRect[2], _flashRect[3], _flashPoint.x, _flashPoint.y, this._tileWidth, this._tileHeight);
                _flashPoint.x += this._tileWidth;
            }
            ri += this.widthInTiles;
            _flashPoint.x = opx;
            _flashPoint.y += this._tileHeight;
        }
    },
    updateTile: function(index) {
        if (this._data[index] < this.drawIndex) {
            this._rects[index] = null;
            return;
        }
        var rx = (this._data[index] - this.startingIndex) * this._tileWidth;
        var ry = 0;
        if (rx >= this._pixels.width) {
            ry = Math.floor(Math.abs(rx / this._pixels.width)) * this._tileHeight;
            rx = rx % this._pixels.width;
        }
        this._rects[index] = [rx, ry, this._tileWidth, this._tileHeight];
    },
    autoTile: function(Index) {
        if (this._data[Index] == 0) return;
        this._data[Index] = 0;
        if ((Index - this.widthInTiles < 0) || (this._data[Index - this.widthInTiles] > 0)) //UP
        this._data[Index] += 1;
        if ((Index % this.widthInTiles >= this.widthInTiles - 1) || (this._data[Index + 1] > 0)) //RIGHT
        this._data[Index] += 2;
        if ((Index + this.widthInTiles >= this.totalTiles) || (this._data[Index + this.widthInTiles] > 0)) //DOWN
        this._data[Index] += 4;
        if ((Index % this.widthInTiles <= 0) || (this._data[Index - 1] > 0)) //LEFT
        this._data[Index] += 8;

        //The alternate algo checks for interior corners
        if ((this.auto == Jxl.TileMapALT) && (this._data[Index] == 15)) {
            if ((Index % this.widthInTiles > 0) && (Index + this.widthInTiles < this.totalTiles) && (this._data[Index + this.widthInTiles - 1] <= 0)) this._data[Index] = 1; //BOTTOM LEFT OPEN
            if ((Index % this.widthInTiles > 0) && (Index - this.widthInTiles >= 0) && (this._data[Index - this.widthInTiles - 1] <= 0)) this._data[Index] = 2; //TOP LEFT OPEN
            if ((Index % this.widthInTiles < this.widthInTiles - 1) && (Index - this.widthInTiles >= 0) && (this._data[Index - this.widthInTiles + 1] <= 0)) this._data[Index] = 4; //TOP RIGHT OPEN
            if ((Index % this.widthInTiles < this.widthInTiles - 1) && (Index + this.widthInTiles < this.totalTiles) && (this._data[Index + this.widthInTiles + 1] <= 0)) this._data[Index] = 8; //BOTTOM RIGHT OPEN
        }
        this._data[Index] += 1;
    },
    overlaps: function(Core) {
        var d;

        var dd;
        var blocks = new Array();

        //First make a list of all the blocks we'll use for collision
        var ix = Math.floor((Core.x - this.x) / this._tileWidth);
        var iy = Math.floor((Core.y - this.y) / this._tileHeight);
        var iw = Math.ceil(Core.width / this._tileWidth) + 1;
        var ih = Math.ceil(Core.height / this._tileHeight) + 1;
        var r = 0;
        var c;
        while (r < ih) {
            if (r >= this.heightInTiles) break;
            d = (iy + r) * this.widthInTiles + ix;
            c = 0;
            while (c < iw) {
                if (c >= this.widthInTiles) break;
                dd = Math.floor(this._data[d + c]);
                if (dd >= this.collideIndex) {
                    blocks.push({
                        x: this.x + (ix + c) * this._tileWidth,
                        y: this.y + (iy + r) * this._tileHeight,
                        data: dd
                    });
                }
                c++;
            }
            r++;
        }

        //Then check for overlaps
        var bl = blocks.length;
        var hx = false;
        var i = 0;
        while (i < bl) {
            this._block.x = blocks[i].x;
            this._block.y = blocks[i++].y;
            if (this._block.overlaps(Core)) return true;
        }
        return false;
    },
    renderTileBB: function(X, Y) {
        if ((X >= this.widthInTiles) || (Y >= this.heightInTiles)) return;
        Jxl.buffer.strokeStyle = this.border.color;
        Jxl.buffer.lineWidth = this.border.thickness;
        Jxl.buffer.strokeRect(this._point.x - this.border.thickness + X * this.tileWidth, this._point.y - this.border.thickness + Y * this.tileHeight, this.tileWidth + this.border.thickness, this.tileHeight + this.border.thickness);
    },
    setTile: function(X, Y, Tile, UpdateGraphics) {
        UpdateGraphics = (UpdateGraphics === undefined) ? true : UpdateGraphics;
        if ((X >= this.widthInTiles) || (Y >= this.heightInTiles)) return false;
        return this.setTileByIndex(Y * this.widthInTiles + X, Tile, UpdateGraphics);
    },
    setTileByIndex: function(Index, Tile, UpdateGraphics) {
        UpdateGraphics = (UpdateGraphics === undefined) ? true : UpdateGraphics;
        if (Index >= this._data.length) return false;

        var ok = true;
        this._data[Index] = Tile;

        if (!UpdateGraphics) return ok;

        this.refresh = true;

        if (this.auto == Jxl.TilemapOFF) {
            this.updateTile(Index);
            return ok;
        }

        //If this map is autotiled and it changes, locally update the arrangement
        var i;
        var r = Math.floor(Index / this.widthInTiles) - 1;
        var rl = r + 3;
        var c = Index % this.widthInTiles - 1;
        var cl = c + 3;
        while (r < rl) {
            c = cl - 3;
            while (c < cl) {
                if ((r >= 0) && (r < this.heightInTiles) && (c >= 0) && (c < this.widthInTiles)) {
                    i = r * this.widthInTiles + c;
                    this.autoTile(i);
                    this.updateTile(i);
                }
                c++;
            }
            r++;
        }

        return ok;
    },
    overlapsPoint: function(X, Y, PerPixel) {
        var t = getTile(
        Math.floor((X - this.x) / this._tileWidth), Math.floor((Y - this.y) / this._tileHeight));
        return t >= this.collideIndex;
    },
    refreshHulls: function() {
        this.colHullX.x = 0;
        this.colHullX.y = 0;
        this.colHullX.width = this._tileWidth;
        this.colHullX.height = this._tileHeight;
        this.colHullY.x = 0;
        this.colHullY.y = 0;
        this.colHullY.width = this._tileWidth;
        this.colHullY.height = this._tileHeight;
    },
    preCollide: function(Obj) {
        var r;
        var c;
        var rs;
        var col = 0;
        var ix = Math.floor((Obj.x - this.x) / this._tileWidth);
        var iy = Math.floor((Obj.y - this.y) / this._tileHeight);

        var iw = ix + Math.ceil(Obj.width / this._tileWidth + 1);
        var ih = iy + Math.ceil(Obj.height / this._tileHeight + 1);
        if (ix < 0) ix = 0;
        if (iy < 0) iy = 0;
        if (iw > this.widthInTiles) iw = this.widthInTiles;
        if (ih > this.heightInTiles) ih = this.heightInTiles;
        rs = iy * this.widthInTiles;
        r = iy;
        for (r = iy; r < ih; r++) {
            for (c = ix; c < iw; c++) {
                if (Math.floor(Math.abs(this._data[rs + c])) >= this.collideIndex) this.colOffsets[col++] = new Jxl.Point({
                    x: this.x + c * this._tileWidth,
                    y: this.y + r * this._tileHeight
                });
            }
            rs += this.widthInTiles;
        }
        if (this.colOffsets.length != col) this.colOffsets.length = col;
    },
    ray: function(StartX, StartY, EndX, EndY, Result, Resolution) {
        Resolution = (Resolution === undefined) ? 1 : Resolution;
        var step = this._tileWidth;
        if (this._tileHeight < this._tileWidth) {
            step = this._tileHeight;
        }
        step /= Resolution;
        var dx = EndX - StartX;
        var dy = EndY - StartY;
        var distance = Math.sqrt(dx * dx + dy * dy);
        var steps = Math.ceil(distance / step);
        var stepX = dx / steps;
        var stepY = dy / steps;
        var curX = StartX - stepX;
        var curY = StartY - stepY;
        var tx;
        var ty;
        var i = 0;
        while (i < steps) {
            curX += stepX;
            curY += stepY;

            if ((curX < 0) || (curX > width) || (curY < 0) || (curY > height)) {
                i++;
                continue;
            }

            tx = curX / this._tileWidth;
            ty = curY / this._tileHeight;
            if ((Math.floor(this._data[ty * this.widthInTiles + tx])) >= this.collideIndex) {
                //Some basic helper stuff
                tx *= this._tileWidth;
                ty *= this._tileHeight;
                var rx = 0;
                var ry = 0;
                var q;
                var lx = curX - stepX;
                var ly = curY - stepY;

                //Figure out if it crosses the X boundary
                q = tx;
                if (dx < 0) q += this._tileWidth;
                rx = q;
                ry = ly + stepY * ((q - lx) / stepX);
                if ((ry > ty) && (ry < ty + this._tileHeight)) {
                    if (Result === undefined) Result = new Jxl.Point();
                    Result.x = rx;
                    Result.y = ry;
                    return true;
                }

                //Else, figure out if it crosses the Y boundary
                q = ty;
                if (dy < 0) q += this._tileHeight;
                rx = lx + stepX * ((q - ly) / stepY);
                ry = q;
                if ((rx > tx) && (rx < tx + this._tileWidth)) {
                    if (Result === undefined) Result = new Jxl.Point();
                    Result.x = rx;
                    Result.y = ry;
                    return true;
                }
                return false;
            }
            i++;
        }
        return false;
    }
});
Jxl.TileMapOFF = 0;
Jxl.TileMapAUTO = 1;
Jxl.TileMapALT = 2;
Jxl.TileMap.arrayToCSV = function(Data, Width) {
    var r = 0;
    var c;
    var csv = "";
    var Height = Data.length / Width;
    while (r < Height) {
        c = 0;
        while (c < Width) {
            if (c == 0) {
                if (r == 0) csv += Data[0];
                else csv += "\n" + Data[r * Width];
            }
            else csv += ", " + Data[r * Width + c];
            c++;
        }
        r++;
    }
    return csv;
}