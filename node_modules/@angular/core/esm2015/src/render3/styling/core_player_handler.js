/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,uselessCode} checked by tsc
 */
export class CorePlayerHandler {
    constructor() {
        this._players = [];
    }
    /**
     * @return {?}
     */
    flushPlayers() {
        for (let i = 0; i < this._players.length; i++) {
            /** @type {?} */
            const player = this._players[i];
            if (!player.parent && player.state === 0 /* Pending */) {
                player.play();
            }
        }
        this._players.length = 0;
    }
    /**
     * @param {?} player
     * @return {?}
     */
    queuePlayer(player) { this._players.push(player); }
}
if (false) {
    /** @type {?} */
    CorePlayerHandler.prototype._players;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29yZV9wbGF5ZXJfaGFuZGxlci5qcyIsInNvdXJjZVJvb3QiOiIuLi8uLi8iLCJzb3VyY2VzIjpbInBhY2thZ2VzL2NvcmUvc3JjL3JlbmRlcjMvc3R5bGluZy9jb3JlX3BsYXllcl9oYW5kbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7QUFTQSxNQUFNLE9BQU8saUJBQWlCO0lBQTlCO1FBQ1UsYUFBUSxHQUFhLEVBQUUsQ0FBQztJQWFsQyxDQUFDOzs7O0lBWEMsWUFBWTtRQUNWLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTs7a0JBQ3ZDLE1BQU0sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sSUFBSSxNQUFNLENBQUMsS0FBSyxvQkFBc0IsRUFBRTtnQkFDeEQsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO2FBQ2Y7U0FDRjtRQUNELElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztJQUMzQixDQUFDOzs7OztJQUVELFdBQVcsQ0FBQyxNQUFjLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQzVEOzs7SUFiQyxxQ0FBZ0MiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge1BsYXlTdGF0ZSwgUGxheWVyLCBQbGF5ZXJIYW5kbGVyfSBmcm9tICcuLi9pbnRlcmZhY2VzL3BsYXllcic7XG5cbmV4cG9ydCBjbGFzcyBDb3JlUGxheWVySGFuZGxlciBpbXBsZW1lbnRzIFBsYXllckhhbmRsZXIge1xuICBwcml2YXRlIF9wbGF5ZXJzOiBQbGF5ZXJbXSA9IFtdO1xuXG4gIGZsdXNoUGxheWVycygpIHtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuX3BsYXllcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNvbnN0IHBsYXllciA9IHRoaXMuX3BsYXllcnNbaV07XG4gICAgICBpZiAoIXBsYXllci5wYXJlbnQgJiYgcGxheWVyLnN0YXRlID09PSBQbGF5U3RhdGUuUGVuZGluZykge1xuICAgICAgICBwbGF5ZXIucGxheSgpO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLl9wbGF5ZXJzLmxlbmd0aCA9IDA7XG4gIH1cblxuICBxdWV1ZVBsYXllcihwbGF5ZXI6IFBsYXllcikgeyB0aGlzLl9wbGF5ZXJzLnB1c2gocGxheWVyKTsgfVxufVxuIl19