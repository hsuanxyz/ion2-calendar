/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { looseIdentical, stringify } from '../../util';
import { isListLikeIterable, iterateListLike } from '../change_detection_util';
export class DefaultIterableDifferFactory {
    constructor() { }
    /**
     * @param {?} obj
     * @return {?}
     */
    supports(obj) { return isListLikeIterable(obj); }
    /**
     * @template V
     * @param {?=} trackByFn
     * @return {?}
     */
    create(trackByFn) {
        return new DefaultIterableDiffer(trackByFn);
    }
}
/** @type {?} */
const trackByIdentity = (index, item) => item;
const ɵ0 = trackByIdentity;
/**
 * @deprecated v4.0.0 - Should not be part of public API.
 * \@publicApi
 * @template V
 */
export class DefaultIterableDiffer {
    /**
     * @param {?=} trackByFn
     */
    constructor(trackByFn) {
        this.length = 0;
        // Keeps track of the used records at any point in time (during & across `_check()` calls)
        this._linkedRecords = null;
        // Keeps track of the removed records at any point in time during `_check()` calls.
        this._unlinkedRecords = null;
        this._previousItHead = null;
        this._itHead = null;
        this._itTail = null;
        this._additionsHead = null;
        this._additionsTail = null;
        this._movesHead = null;
        this._movesTail = null;
        this._removalsHead = null;
        this._removalsTail = null;
        // Keeps track of records where custom track by is the same, but item identity has changed
        this._identityChangesHead = null;
        this._identityChangesTail = null;
        this._trackByFn = trackByFn || trackByIdentity;
    }
    /**
     * @param {?} fn
     * @return {?}
     */
    forEachItem(fn) {
        /** @type {?} */
        let record;
        for (record = this._itHead; record !== null; record = record._next) {
            fn(record);
        }
    }
    /**
     * @param {?} fn
     * @return {?}
     */
    forEachOperation(fn) {
        /** @type {?} */
        let nextIt = this._itHead;
        /** @type {?} */
        let nextRemove = this._removalsHead;
        /** @type {?} */
        let addRemoveOffset = 0;
        /** @type {?} */
        let moveOffsets = null;
        while (nextIt || nextRemove) {
            // Figure out which is the next record to process
            // Order: remove, add, move
            /** @type {?} */
            const record = !nextRemove ||
                nextIt &&
                    (/** @type {?} */ (nextIt.currentIndex)) <
                        getPreviousIndex(nextRemove, addRemoveOffset, moveOffsets) ?
                (/** @type {?} */ (nextIt)) :
                nextRemove;
            /** @type {?} */
            const adjPreviousIndex = getPreviousIndex(record, addRemoveOffset, moveOffsets);
            /** @type {?} */
            const currentIndex = record.currentIndex;
            // consume the item, and adjust the addRemoveOffset and update moveDistance if necessary
            if (record === nextRemove) {
                addRemoveOffset--;
                nextRemove = nextRemove._nextRemoved;
            }
            else {
                nextIt = (/** @type {?} */ (nextIt))._next;
                if (record.previousIndex == null) {
                    addRemoveOffset++;
                }
                else {
                    // INVARIANT:  currentIndex < previousIndex
                    if (!moveOffsets)
                        moveOffsets = [];
                    /** @type {?} */
                    const localMovePreviousIndex = adjPreviousIndex - addRemoveOffset;
                    /** @type {?} */
                    const localCurrentIndex = (/** @type {?} */ (currentIndex)) - addRemoveOffset;
                    if (localMovePreviousIndex != localCurrentIndex) {
                        for (let i = 0; i < localMovePreviousIndex; i++) {
                            /** @type {?} */
                            const offset = i < moveOffsets.length ? moveOffsets[i] : (moveOffsets[i] = 0);
                            /** @type {?} */
                            const index = offset + i;
                            if (localCurrentIndex <= index && index < localMovePreviousIndex) {
                                moveOffsets[i] = offset + 1;
                            }
                        }
                        /** @type {?} */
                        const previousIndex = record.previousIndex;
                        moveOffsets[previousIndex] = localCurrentIndex - localMovePreviousIndex;
                    }
                }
            }
            if (adjPreviousIndex !== currentIndex) {
                fn(record, adjPreviousIndex, currentIndex);
            }
        }
    }
    /**
     * @param {?} fn
     * @return {?}
     */
    forEachPreviousItem(fn) {
        /** @type {?} */
        let record;
        for (record = this._previousItHead; record !== null; record = record._nextPrevious) {
            fn(record);
        }
    }
    /**
     * @param {?} fn
     * @return {?}
     */
    forEachAddedItem(fn) {
        /** @type {?} */
        let record;
        for (record = this._additionsHead; record !== null; record = record._nextAdded) {
            fn(record);
        }
    }
    /**
     * @param {?} fn
     * @return {?}
     */
    forEachMovedItem(fn) {
        /** @type {?} */
        let record;
        for (record = this._movesHead; record !== null; record = record._nextMoved) {
            fn(record);
        }
    }
    /**
     * @param {?} fn
     * @return {?}
     */
    forEachRemovedItem(fn) {
        /** @type {?} */
        let record;
        for (record = this._removalsHead; record !== null; record = record._nextRemoved) {
            fn(record);
        }
    }
    /**
     * @param {?} fn
     * @return {?}
     */
    forEachIdentityChange(fn) {
        /** @type {?} */
        let record;
        for (record = this._identityChangesHead; record !== null; record = record._nextIdentityChange) {
            fn(record);
        }
    }
    /**
     * @param {?} collection
     * @return {?}
     */
    diff(collection) {
        if (collection == null)
            collection = [];
        if (!isListLikeIterable(collection)) {
            throw new Error(`Error trying to diff '${stringify(collection)}'. Only arrays and iterables are allowed`);
        }
        if (this.check(collection)) {
            return this;
        }
        else {
            return null;
        }
    }
    /**
     * @return {?}
     */
    onDestroy() { }
    /**
     * @param {?} collection
     * @return {?}
     */
    check(collection) {
        this._reset();
        /** @type {?} */
        let record = this._itHead;
        /** @type {?} */
        let mayBeDirty = false;
        /** @type {?} */
        let index;
        /** @type {?} */
        let item;
        /** @type {?} */
        let itemTrackBy;
        if (Array.isArray(collection)) {
            ((/** @type {?} */ (this))).length = collection.length;
            for (let index = 0; index < this.length; index++) {
                item = collection[index];
                itemTrackBy = this._trackByFn(index, item);
                if (record === null || !looseIdentical(record.trackById, itemTrackBy)) {
                    record = this._mismatch(record, item, itemTrackBy, index);
                    mayBeDirty = true;
                }
                else {
                    if (mayBeDirty) {
                        // TODO(misko): can we limit this to duplicates only?
                        record = this._verifyReinsertion(record, item, itemTrackBy, index);
                    }
                    if (!looseIdentical(record.item, item))
                        this._addIdentityChange(record, item);
                }
                record = record._next;
            }
        }
        else {
            index = 0;
            iterateListLike(collection, (item) => {
                itemTrackBy = this._trackByFn(index, item);
                if (record === null || !looseIdentical(record.trackById, itemTrackBy)) {
                    record = this._mismatch(record, item, itemTrackBy, index);
                    mayBeDirty = true;
                }
                else {
                    if (mayBeDirty) {
                        // TODO(misko): can we limit this to duplicates only?
                        record = this._verifyReinsertion(record, item, itemTrackBy, index);
                    }
                    if (!looseIdentical(record.item, item))
                        this._addIdentityChange(record, item);
                }
                record = record._next;
                index++;
            });
            ((/** @type {?} */ (this))).length = index;
        }
        this._truncate(record);
        ((/** @type {?} */ (this))).collection = collection;
        return this.isDirty;
    }
    /* CollectionChanges is considered dirty if it has any additions, moves, removals, or identity
       * changes.
       */
    /**
     * @return {?}
     */
    get isDirty() {
        return this._additionsHead !== null || this._movesHead !== null ||
            this._removalsHead !== null || this._identityChangesHead !== null;
    }
    /**
     * Reset the state of the change objects to show no changes. This means set previousKey to
     * currentKey, and clear all of the queues (additions, moves, removals).
     * Set the previousIndexes of moved and added items to their currentIndexes
     * Reset the list of additions, moves and removals
     *
     * \@internal
     * @return {?}
     */
    _reset() {
        if (this.isDirty) {
            /** @type {?} */
            let record;
            /** @type {?} */
            let nextRecord;
            for (record = this._previousItHead = this._itHead; record !== null; record = record._next) {
                record._nextPrevious = record._next;
            }
            for (record = this._additionsHead; record !== null; record = record._nextAdded) {
                record.previousIndex = record.currentIndex;
            }
            this._additionsHead = this._additionsTail = null;
            for (record = this._movesHead; record !== null; record = nextRecord) {
                record.previousIndex = record.currentIndex;
                nextRecord = record._nextMoved;
            }
            this._movesHead = this._movesTail = null;
            this._removalsHead = this._removalsTail = null;
            this._identityChangesHead = this._identityChangesTail = null;
            // TODO(vicb): when assert gets supported
            // assert(!this.isDirty);
        }
    }
    /**
     * This is the core function which handles differences between collections.
     *
     * - `record` is the record which we saw at this position last time. If null then it is a new
     *   item.
     * - `item` is the current item in the collection
     * - `index` is the position of the item in the collection
     *
     * \@internal
     * @param {?} record
     * @param {?} item
     * @param {?} itemTrackBy
     * @param {?} index
     * @return {?}
     */
    _mismatch(record, item, itemTrackBy, index) {
        // The previous record after which we will append the current one.
        /** @type {?} */
        let previousRecord;
        if (record === null) {
            previousRecord = this._itTail;
        }
        else {
            previousRecord = record._prev;
            // Remove the record from the collection since we know it does not match the item.
            this._remove(record);
        }
        // Attempt to see if we have seen the item before.
        record = this._linkedRecords === null ? null : this._linkedRecords.get(itemTrackBy, index);
        if (record !== null) {
            // We have seen this before, we need to move it forward in the collection.
            // But first we need to check if identity changed, so we can update in view if necessary
            if (!looseIdentical(record.item, item))
                this._addIdentityChange(record, item);
            this._moveAfter(record, previousRecord, index);
        }
        else {
            // Never seen it, check evicted list.
            record = this._unlinkedRecords === null ? null : this._unlinkedRecords.get(itemTrackBy, null);
            if (record !== null) {
                // It is an item which we have evicted earlier: reinsert it back into the list.
                // But first we need to check if identity changed, so we can update in view if necessary
                if (!looseIdentical(record.item, item))
                    this._addIdentityChange(record, item);
                this._reinsertAfter(record, previousRecord, index);
            }
            else {
                // It is a new item: add it.
                record =
                    this._addAfter(new IterableChangeRecord_(item, itemTrackBy), previousRecord, index);
            }
        }
        return record;
    }
    /**
     * This check is only needed if an array contains duplicates. (Short circuit of nothing dirty)
     *
     * Use case: `[a, a]` => `[b, a, a]`
     *
     * If we did not have this check then the insertion of `b` would:
     *   1) evict first `a`
     *   2) insert `b` at `0` index.
     *   3) leave `a` at index `1` as is. <-- this is wrong!
     *   3) reinsert `a` at index 2. <-- this is wrong!
     *
     * The correct behavior is:
     *   1) evict first `a`
     *   2) insert `b` at `0` index.
     *   3) reinsert `a` at index 1.
     *   3) move `a` at from `1` to `2`.
     *
     *
     * Double check that we have not evicted a duplicate item. We need to check if the item type may
     * have already been removed:
     * The insertion of b will evict the first 'a'. If we don't reinsert it now it will be reinserted
     * at the end. Which will show up as the two 'a's switching position. This is incorrect, since a
     * better way to think of it is as insert of 'b' rather then switch 'a' with 'b' and then add 'a'
     * at the end.
     *
     * \@internal
     * @param {?} record
     * @param {?} item
     * @param {?} itemTrackBy
     * @param {?} index
     * @return {?}
     */
    _verifyReinsertion(record, item, itemTrackBy, index) {
        /** @type {?} */
        let reinsertRecord = this._unlinkedRecords === null ? null : this._unlinkedRecords.get(itemTrackBy, null);
        if (reinsertRecord !== null) {
            record = this._reinsertAfter(reinsertRecord, (/** @type {?} */ (record._prev)), index);
        }
        else if (record.currentIndex != index) {
            record.currentIndex = index;
            this._addToMoves(record, index);
        }
        return record;
    }
    /**
     * Get rid of any excess {\@link IterableChangeRecord_}s from the previous collection
     *
     * - `record` The first excess {\@link IterableChangeRecord_}.
     *
     * \@internal
     * @param {?} record
     * @return {?}
     */
    _truncate(record) {
        // Anything after that needs to be removed;
        while (record !== null) {
            /** @type {?} */
            const nextRecord = record._next;
            this._addToRemovals(this._unlink(record));
            record = nextRecord;
        }
        if (this._unlinkedRecords !== null) {
            this._unlinkedRecords.clear();
        }
        if (this._additionsTail !== null) {
            this._additionsTail._nextAdded = null;
        }
        if (this._movesTail !== null) {
            this._movesTail._nextMoved = null;
        }
        if (this._itTail !== null) {
            this._itTail._next = null;
        }
        if (this._removalsTail !== null) {
            this._removalsTail._nextRemoved = null;
        }
        if (this._identityChangesTail !== null) {
            this._identityChangesTail._nextIdentityChange = null;
        }
    }
    /**
     * \@internal
     * @param {?} record
     * @param {?} prevRecord
     * @param {?} index
     * @return {?}
     */
    _reinsertAfter(record, prevRecord, index) {
        if (this._unlinkedRecords !== null) {
            this._unlinkedRecords.remove(record);
        }
        /** @type {?} */
        const prev = record._prevRemoved;
        /** @type {?} */
        const next = record._nextRemoved;
        if (prev === null) {
            this._removalsHead = next;
        }
        else {
            prev._nextRemoved = next;
        }
        if (next === null) {
            this._removalsTail = prev;
        }
        else {
            next._prevRemoved = prev;
        }
        this._insertAfter(record, prevRecord, index);
        this._addToMoves(record, index);
        return record;
    }
    /**
     * \@internal
     * @param {?} record
     * @param {?} prevRecord
     * @param {?} index
     * @return {?}
     */
    _moveAfter(record, prevRecord, index) {
        this._unlink(record);
        this._insertAfter(record, prevRecord, index);
        this._addToMoves(record, index);
        return record;
    }
    /**
     * \@internal
     * @param {?} record
     * @param {?} prevRecord
     * @param {?} index
     * @return {?}
     */
    _addAfter(record, prevRecord, index) {
        this._insertAfter(record, prevRecord, index);
        if (this._additionsTail === null) {
            // TODO(vicb):
            // assert(this._additionsHead === null);
            this._additionsTail = this._additionsHead = record;
        }
        else {
            // TODO(vicb):
            // assert(_additionsTail._nextAdded === null);
            // assert(record._nextAdded === null);
            this._additionsTail = this._additionsTail._nextAdded = record;
        }
        return record;
    }
    /**
     * \@internal
     * @param {?} record
     * @param {?} prevRecord
     * @param {?} index
     * @return {?}
     */
    _insertAfter(record, prevRecord, index) {
        // TODO(vicb):
        // assert(record != prevRecord);
        // assert(record._next === null);
        // assert(record._prev === null);
        // TODO(vicb):
        // assert(record != prevRecord);
        // assert(record._next === null);
        // assert(record._prev === null);
        /** @type {?} */
        const next = prevRecord === null ? this._itHead : prevRecord._next;
        // TODO(vicb):
        // assert(next != record);
        // assert(prevRecord != record);
        record._next = next;
        record._prev = prevRecord;
        if (next === null) {
            this._itTail = record;
        }
        else {
            next._prev = record;
        }
        if (prevRecord === null) {
            this._itHead = record;
        }
        else {
            prevRecord._next = record;
        }
        if (this._linkedRecords === null) {
            this._linkedRecords = new _DuplicateMap();
        }
        this._linkedRecords.put(record);
        record.currentIndex = index;
        return record;
    }
    /**
     * \@internal
     * @param {?} record
     * @return {?}
     */
    _remove(record) {
        return this._addToRemovals(this._unlink(record));
    }
    /**
     * \@internal
     * @param {?} record
     * @return {?}
     */
    _unlink(record) {
        if (this._linkedRecords !== null) {
            this._linkedRecords.remove(record);
        }
        /** @type {?} */
        const prev = record._prev;
        /** @type {?} */
        const next = record._next;
        // TODO(vicb):
        // assert((record._prev = null) === null);
        // assert((record._next = null) === null);
        if (prev === null) {
            this._itHead = next;
        }
        else {
            prev._next = next;
        }
        if (next === null) {
            this._itTail = prev;
        }
        else {
            next._prev = prev;
        }
        return record;
    }
    /**
     * \@internal
     * @param {?} record
     * @param {?} toIndex
     * @return {?}
     */
    _addToMoves(record, toIndex) {
        // TODO(vicb):
        // assert(record._nextMoved === null);
        if (record.previousIndex === toIndex) {
            return record;
        }
        if (this._movesTail === null) {
            // TODO(vicb):
            // assert(_movesHead === null);
            this._movesTail = this._movesHead = record;
        }
        else {
            // TODO(vicb):
            // assert(_movesTail._nextMoved === null);
            this._movesTail = this._movesTail._nextMoved = record;
        }
        return record;
    }
    /**
     * @param {?} record
     * @return {?}
     */
    _addToRemovals(record) {
        if (this._unlinkedRecords === null) {
            this._unlinkedRecords = new _DuplicateMap();
        }
        this._unlinkedRecords.put(record);
        record.currentIndex = null;
        record._nextRemoved = null;
        if (this._removalsTail === null) {
            // TODO(vicb):
            // assert(_removalsHead === null);
            this._removalsTail = this._removalsHead = record;
            record._prevRemoved = null;
        }
        else {
            // TODO(vicb):
            // assert(_removalsTail._nextRemoved === null);
            // assert(record._nextRemoved === null);
            record._prevRemoved = this._removalsTail;
            this._removalsTail = this._removalsTail._nextRemoved = record;
        }
        return record;
    }
    /**
     * \@internal
     * @param {?} record
     * @param {?} item
     * @return {?}
     */
    _addIdentityChange(record, item) {
        record.item = item;
        if (this._identityChangesTail === null) {
            this._identityChangesTail = this._identityChangesHead = record;
        }
        else {
            this._identityChangesTail = this._identityChangesTail._nextIdentityChange = record;
        }
        return record;
    }
}
if (false) {
    /** @type {?} */
    DefaultIterableDiffer.prototype.length;
    /** @type {?} */
    DefaultIterableDiffer.prototype.collection;
    /** @type {?} */
    DefaultIterableDiffer.prototype._linkedRecords;
    /** @type {?} */
    DefaultIterableDiffer.prototype._unlinkedRecords;
    /** @type {?} */
    DefaultIterableDiffer.prototype._previousItHead;
    /** @type {?} */
    DefaultIterableDiffer.prototype._itHead;
    /** @type {?} */
    DefaultIterableDiffer.prototype._itTail;
    /** @type {?} */
    DefaultIterableDiffer.prototype._additionsHead;
    /** @type {?} */
    DefaultIterableDiffer.prototype._additionsTail;
    /** @type {?} */
    DefaultIterableDiffer.prototype._movesHead;
    /** @type {?} */
    DefaultIterableDiffer.prototype._movesTail;
    /** @type {?} */
    DefaultIterableDiffer.prototype._removalsHead;
    /** @type {?} */
    DefaultIterableDiffer.prototype._removalsTail;
    /** @type {?} */
    DefaultIterableDiffer.prototype._identityChangesHead;
    /** @type {?} */
    DefaultIterableDiffer.prototype._identityChangesTail;
    /** @type {?} */
    DefaultIterableDiffer.prototype._trackByFn;
}
/**
 * @template V
 */
export class IterableChangeRecord_ {
    /**
     * @param {?} item
     * @param {?} trackById
     */
    constructor(item, trackById) {
        this.item = item;
        this.trackById = trackById;
        this.currentIndex = null;
        this.previousIndex = null;
        /**
         * \@internal
         */
        this._nextPrevious = null;
        /**
         * \@internal
         */
        this._prev = null;
        /**
         * \@internal
         */
        this._next = null;
        /**
         * \@internal
         */
        this._prevDup = null;
        /**
         * \@internal
         */
        this._nextDup = null;
        /**
         * \@internal
         */
        this._prevRemoved = null;
        /**
         * \@internal
         */
        this._nextRemoved = null;
        /**
         * \@internal
         */
        this._nextAdded = null;
        /**
         * \@internal
         */
        this._nextMoved = null;
        /**
         * \@internal
         */
        this._nextIdentityChange = null;
    }
}
if (false) {
    /** @type {?} */
    IterableChangeRecord_.prototype.currentIndex;
    /** @type {?} */
    IterableChangeRecord_.prototype.previousIndex;
    /**
     * \@internal
     * @type {?}
     */
    IterableChangeRecord_.prototype._nextPrevious;
    /**
     * \@internal
     * @type {?}
     */
    IterableChangeRecord_.prototype._prev;
    /**
     * \@internal
     * @type {?}
     */
    IterableChangeRecord_.prototype._next;
    /**
     * \@internal
     * @type {?}
     */
    IterableChangeRecord_.prototype._prevDup;
    /**
     * \@internal
     * @type {?}
     */
    IterableChangeRecord_.prototype._nextDup;
    /**
     * \@internal
     * @type {?}
     */
    IterableChangeRecord_.prototype._prevRemoved;
    /**
     * \@internal
     * @type {?}
     */
    IterableChangeRecord_.prototype._nextRemoved;
    /**
     * \@internal
     * @type {?}
     */
    IterableChangeRecord_.prototype._nextAdded;
    /**
     * \@internal
     * @type {?}
     */
    IterableChangeRecord_.prototype._nextMoved;
    /**
     * \@internal
     * @type {?}
     */
    IterableChangeRecord_.prototype._nextIdentityChange;
    /** @type {?} */
    IterableChangeRecord_.prototype.item;
    /** @type {?} */
    IterableChangeRecord_.prototype.trackById;
}
// A linked list of CollectionChangeRecords with the same IterableChangeRecord_.item
/**
 * @template V
 */
class _DuplicateItemRecordList {
    constructor() {
        /**
         * \@internal
         */
        this._head = null;
        /**
         * \@internal
         */
        this._tail = null;
    }
    /**
     * Append the record to the list of duplicates.
     *
     * Note: by design all records in the list of duplicates hold the same value in record.item.
     * @param {?} record
     * @return {?}
     */
    add(record) {
        if (this._head === null) {
            this._head = this._tail = record;
            record._nextDup = null;
            record._prevDup = null;
        }
        else {
            // TODO(vicb):
            // assert(record.item ==  _head.item ||
            //       record.item is num && record.item.isNaN && _head.item is num && _head.item.isNaN);
            (/** @type {?} */ (this._tail))._nextDup = record;
            record._prevDup = this._tail;
            record._nextDup = null;
            this._tail = record;
        }
    }
    // Returns a IterableChangeRecord_ having IterableChangeRecord_.trackById == trackById and
    // IterableChangeRecord_.currentIndex >= atOrAfterIndex
    /**
     * @param {?} trackById
     * @param {?} atOrAfterIndex
     * @return {?}
     */
    get(trackById, atOrAfterIndex) {
        /** @type {?} */
        let record;
        for (record = this._head; record !== null; record = record._nextDup) {
            if ((atOrAfterIndex === null || atOrAfterIndex <= (/** @type {?} */ (record.currentIndex))) &&
                looseIdentical(record.trackById, trackById)) {
                return record;
            }
        }
        return null;
    }
    /**
     * Remove one {\@link IterableChangeRecord_} from the list of duplicates.
     *
     * Returns whether the list of duplicates is empty.
     * @param {?} record
     * @return {?}
     */
    remove(record) {
        // TODO(vicb):
        // assert(() {
        //  // verify that the record being removed is in the list.
        //  for (IterableChangeRecord_ cursor = _head; cursor != null; cursor = cursor._nextDup) {
        //    if (identical(cursor, record)) return true;
        //  }
        //  return false;
        //});
        // TODO(vicb):
        // assert(() {
        //  // verify that the record being removed is in the list.
        //  for (IterableChangeRecord_ cursor = _head; cursor != null; cursor = cursor._nextDup) {
        //    if (identical(cursor, record)) return true;
        //  }
        //  return false;
        //});
        /** @type {?} */
        const prev = record._prevDup;
        /** @type {?} */
        const next = record._nextDup;
        if (prev === null) {
            this._head = next;
        }
        else {
            prev._nextDup = next;
        }
        if (next === null) {
            this._tail = prev;
        }
        else {
            next._prevDup = prev;
        }
        return this._head === null;
    }
}
if (false) {
    /**
     * \@internal
     * @type {?}
     */
    _DuplicateItemRecordList.prototype._head;
    /**
     * \@internal
     * @type {?}
     */
    _DuplicateItemRecordList.prototype._tail;
}
/**
 * @template V
 */
class _DuplicateMap {
    constructor() {
        this.map = new Map();
    }
    /**
     * @param {?} record
     * @return {?}
     */
    put(record) {
        /** @type {?} */
        const key = record.trackById;
        /** @type {?} */
        let duplicates = this.map.get(key);
        if (!duplicates) {
            duplicates = new _DuplicateItemRecordList();
            this.map.set(key, duplicates);
        }
        duplicates.add(record);
    }
    /**
     * Retrieve the `value` using key. Because the IterableChangeRecord_ value may be one which we
     * have already iterated over, we use the `atOrAfterIndex` to pretend it is not there.
     *
     * Use case: `[a, b, c, a, a]` if we are at index `3` which is the second `a` then asking if we
     * have any more `a`s needs to return the second `a`.
     * @param {?} trackById
     * @param {?} atOrAfterIndex
     * @return {?}
     */
    get(trackById, atOrAfterIndex) {
        /** @type {?} */
        const key = trackById;
        /** @type {?} */
        const recordList = this.map.get(key);
        return recordList ? recordList.get(trackById, atOrAfterIndex) : null;
    }
    /**
     * Removes a {\@link IterableChangeRecord_} from the list of duplicates.
     *
     * The list of duplicates also is removed from the map if it gets empty.
     * @param {?} record
     * @return {?}
     */
    remove(record) {
        /** @type {?} */
        const key = record.trackById;
        /** @type {?} */
        const recordList = (/** @type {?} */ (this.map.get(key)));
        // Remove the list of duplicates when it gets empty
        if (recordList.remove(record)) {
            this.map.delete(key);
        }
        return record;
    }
    /**
     * @return {?}
     */
    get isEmpty() { return this.map.size === 0; }
    /**
     * @return {?}
     */
    clear() { this.map.clear(); }
}
if (false) {
    /** @type {?} */
    _DuplicateMap.prototype.map;
}
/**
 * @param {?} item
 * @param {?} addRemoveOffset
 * @param {?} moveOffsets
 * @return {?}
 */
function getPreviousIndex(item, addRemoveOffset, moveOffsets) {
    /** @type {?} */
    const previousIndex = item.previousIndex;
    if (previousIndex === null)
        return previousIndex;
    /** @type {?} */
    let moveOffset = 0;
    if (moveOffsets && previousIndex < moveOffsets.length) {
        moveOffset = moveOffsets[previousIndex];
    }
    return previousIndex + addRemoveOffset + moveOffset;
}
export { ɵ0 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVmYXVsdF9pdGVyYWJsZV9kaWZmZXIuanMiLCJzb3VyY2VSb290IjoiLi4vLi4vIiwic291cmNlcyI6WyJwYWNrYWdlcy9jb3JlL3NyYy9jaGFuZ2VfZGV0ZWN0aW9uL2RpZmZlcnMvZGVmYXVsdF9pdGVyYWJsZV9kaWZmZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFRQSxPQUFPLEVBQUMsY0FBYyxFQUFFLFNBQVMsRUFBQyxNQUFNLFlBQVksQ0FBQztBQUNyRCxPQUFPLEVBQUMsa0JBQWtCLEVBQUUsZUFBZSxFQUFDLE1BQU0sMEJBQTBCLENBQUM7QUFJN0UsTUFBTSxPQUFPLDRCQUE0QjtJQUN2QyxnQkFBZSxDQUFDOzs7OztJQUNoQixRQUFRLENBQUMsR0FBMEIsSUFBYSxPQUFPLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7Ozs7O0lBRWpGLE1BQU0sQ0FBSSxTQUE4QjtRQUN0QyxPQUFPLElBQUkscUJBQXFCLENBQUksU0FBUyxDQUFDLENBQUM7SUFDakQsQ0FBQztDQUNGOztNQUVLLGVBQWUsR0FBRyxDQUFDLEtBQWEsRUFBRSxJQUFTLEVBQUUsRUFBRSxDQUFDLElBQUk7Ozs7Ozs7QUFNMUQsTUFBTSxPQUFPLHFCQUFxQjs7OztJQXNCaEMsWUFBWSxTQUE4QjtRQXJCMUIsV0FBTSxHQUFXLENBQUMsQ0FBQzs7UUFJM0IsbUJBQWMsR0FBMEIsSUFBSSxDQUFDOztRQUU3QyxxQkFBZ0IsR0FBMEIsSUFBSSxDQUFDO1FBQy9DLG9CQUFlLEdBQWtDLElBQUksQ0FBQztRQUN0RCxZQUFPLEdBQWtDLElBQUksQ0FBQztRQUM5QyxZQUFPLEdBQWtDLElBQUksQ0FBQztRQUM5QyxtQkFBYyxHQUFrQyxJQUFJLENBQUM7UUFDckQsbUJBQWMsR0FBa0MsSUFBSSxDQUFDO1FBQ3JELGVBQVUsR0FBa0MsSUFBSSxDQUFDO1FBQ2pELGVBQVUsR0FBa0MsSUFBSSxDQUFDO1FBQ2pELGtCQUFhLEdBQWtDLElBQUks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Q0FBQyxHQUFHLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Ozs7SUFFdEQsS0FBSyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO0NBQzlCOzs7SUE1Q0MsNEJBQWtEOzs7Ozs7OztBQThDcEQsU0FBUyxnQkFBZ0IsQ0FDckIsSUFBUyxFQUFFLGVBQXVCLEVBQUUsV0FBNEI7O1VBQzVELGFBQWEsR0FBRyxJQUFJLENBQUMsYUFBYTtJQUN4QyxJQUFJLGFBQWEsS0FBSyxJQUFJO1FBQUUsT0FBTyxhQUFhLENBQUM7O1FBQzdDLFVBQVUsR0FBRyxDQUFDO0lBQ2xCLElBQUksV0FBVyxJQUFJLGFBQWEsR0FBRyxXQUFXLENBQUMsTUFBTSxFQUFFO1FBQ3JELFVBQVUsR0FBRyxXQUFXLENBQUMsYUFBYSxDQUFDLENBQUM7S0FDekM7SUFDRCxPQUFPLGFBQWEsR0FBRyxlQUFlLEdBQUcsVUFBVSxDQUFDO0FBQ3RELENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7bG9vc2VJZGVudGljYWwsIHN0cmluZ2lmeX0gZnJvbSAnLi4vLi4vdXRpbCc7XG5pbXBvcnQge2lzTGlzdExpa2VJdGVyYWJsZSwgaXRlcmF0ZUxpc3RMaWtlfSBmcm9tICcuLi9jaGFuZ2VfZGV0ZWN0aW9uX3V0aWwnO1xuaW1wb3J0IHtJdGVyYWJsZUNoYW5nZVJlY29yZCwgSXRlcmFibGVDaGFuZ2VzLCBJdGVyYWJsZURpZmZlciwgSXRlcmFibGVEaWZmZXJGYWN0b3J5LCBOZ0l0ZXJhYmxlLCBUcmFja0J5RnVuY3Rpb259IGZyb20gJy4vaXRlcmFibGVfZGlmZmVycyc7XG5cblxuZXhwb3J0IGNsYXNzIERlZmF1bHRJdGVyYWJsZURpZmZlckZhY3RvcnkgaW1wbGVtZW50cyBJdGVyYWJsZURpZmZlckZhY3Rvcnkge1xuICBjb25zdHJ1Y3RvcigpIHt9XG4gIHN1cHBvcnRzKG9iajogT2JqZWN0fG51bGx8dW5kZWZpbmVkKTogYm9vbGVhbiB7IHJldHVybiBpc0xpc3RMaWtlSXRlcmFibGUob2JqKTsgfVxuXG4gIGNyZWF0ZTxWPih0cmFja0J5Rm4/OiBUcmFja0J5RnVuY3Rpb248Vj4pOiBEZWZhdWx0SXRlcmFibGVEaWZmZXI8Vj4ge1xuICAgIHJldHVybiBuZXcgRGVmYXVsdEl0ZXJhYmxlRGlmZmVyPFY+KHRyYWNrQnlGbik7XG4gIH1cbn1cblxuY29uc3QgdHJhY2tCeUlkZW50aXR5ID0gKGluZGV4OiBudW1iZXIsIGl0ZW06IGFueSkgPT4gaXRlbTtcblxuLyoqXG4gKiBAZGVwcmVjYXRlZCB2NC4wLjAgLSBTaG91bGQgbm90IGJlIHBhcnQgb2YgcHVibGljIEFQSS5cbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNsYXNzIERlZmF1bHRJdGVyYWJsZURpZmZlcjxWPiBpbXBsZW1lbnRzIEl0ZXJhYmxlRGlmZmVyPFY+LCBJdGVyYWJsZUNoYW5nZXM8Vj4ge1xuICBwdWJsaWMgcmVhZG9ubHkgbGVuZ3RoOiBudW1iZXIgPSAwO1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHVibGljIHJlYWRvbmx5IGNvbGxlY3Rpb24gITogVltdIHwgSXRlcmFibGU8Vj58IG51bGw7XG4gIC8vIEtlZXBzIHRyYWNrIG9mIHRoZSB1c2VkIHJlY29yZHMgYXQgYW55IHBvaW50IGluIHRpbWUgKGR1cmluZyAmIGFjcm9zcyBgX2NoZWNrKClgIGNhbGxzKVxuICBwcml2YXRlIF9saW5rZWRSZWNvcmRzOiBfRHVwbGljYXRlTWFwPFY+fG51bGwgPSBudWxsO1xuICAvLyBLZWVwcyB0cmFjayBvZiB0aGUgcmVtb3ZlZCByZWNvcmRzIGF0IGFueSBwb2ludCBpbiB0aW1lIGR1cmluZyBgX2NoZWNrKClgIGNhbGxzLlxuICBwcml2YXRlIF91bmxpbmtlZFJlY29yZHM6IF9EdXBsaWNhdGVNYXA8Vj58bnVsbCA9IG51bGw7XG4gIHByaXZhdGUgX3ByZXZpb3VzSXRIZWFkOiBJdGVyYWJsZUNoYW5nZVJlY29yZF88Vj58bnVsbCA9IG51bGw7XG4gIHByaXZhdGUgX2l0SGVhZDogSXRlcmFibGVDaGFuZ2VSZWNvcmRfPFY+fG51bGwgPSBudWxsO1xuICBwcml2YXRlIF9pdFRhaWw6IEl0ZXJhYmxlQ2hhbmdlUmVjb3JkXzxWPnxudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBfYWRkaXRpb25zSGVhZDogSXRlcmFibGVDaGFuZ2VSZWNvcmRfPFY+fG51bGwgPSBudWxsO1xuICBwcml2YXRlIF9hZGRpdGlvbnNUYWlsOiBJdGVyYWJsZUNoYW5nZVJlY29yZF88Vj58bnVsbCA9IG51bGw7XG4gIHByaXZhdGUgX21vdmVzSGVhZDogSXRlcmFibGVDaGFuZ2VSZWNvcmRfPFY+fG51bGwgPSBudWxsO1xuICBwcml2YXRlIF9tb3Zlc1RhaWw6IEl0ZXJhYmxlQ2hhbmdlUmVjb3JkXzxWPnxudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSBfcmVtb3ZhbHNIZWFkOiBJdGVyYWJsZUNoYW5nZVJlY29yZF88Vj58bnVsbCA9IG51bGw7XG4gIHByaXZhdGUgX3JlbW92YWxzVGFpbDogSXRlcmFibGVDaGFuZ2VSZWNvcmRfPFY+fG51bGwgPSBudWxsO1xuICAvLyBLZWVwcyB0cmFjayBvZiByZWNvcmRzIHdoZXJlIGN1c3RvbSB0cmFjayBieSBpcyB0aGUgc2FtZSwgYnV0IGl0ZW0gaWRlbnRpdHkgaGFzIGNoYW5nZWRcbiAgcHJpdmF0ZSBfaWRlbnRpdHlDaGFuZ2VzSGVhZDogSXRlcmFibGVDaGFuZ2VSZWNvcmRfPFY+fG51bGwgPSBudWxsO1xuICBwcml2YXRlIF9pZGVudGl0eUNoYW5nZXNUYWlsOiBJdGVyYWJsZUNoYW5nZVJlY29yZF88Vj58bnVsbCA9IG51bGw7XG4gIHByaXZhdGUgX3RyYWNrQnlGbjogVHJhY2tCeUZ1bmN0aW9uPFY+O1xuXG4gIGNvbnN0cnVjdG9yKHRyYWNrQnlGbj86IFRyYWNrQnlGdW5jdGlvbjxWPikgeyB0aGlzLl90cmFja0J5Rm4gPSB0cmFja0J5Rm4gfHwgdHJhY2tCeUlkZW50aXR5OyB9XG5cbiAgZm9yRWFjaEl0ZW0oZm46IChyZWNvcmQ6IEl0ZXJhYmxlQ2hhbmdlUmVjb3JkXzxWPikgPT4gdm9pZCkge1xuICAgIGxldCByZWNvcmQ6IEl0ZXJhYmxlQ2hhbmdlUmVjb3JkXzxWPnxudWxsO1xuICAgIGZvciAocmVjb3JkID0gdGhpcy5faXRIZWFkOyByZWNvcmQgIT09IG51bGw7IHJlY29yZCA9IHJlY29yZC5fbmV4dCkge1xuICAgICAgZm4ocmVjb3JkKTtcbiAgICB9XG4gIH1cblxuICBmb3JFYWNoT3BlcmF0aW9uKFxuICAgICAgZm46IChpdGVtOiBJdGVyYWJsZUNoYW5nZVJlY29yZDxWPiwgcHJldmlvdXNJbmRleDogbnVtYmVyfG51bGwsIGN1cnJlbnRJbmRleDogbnVtYmVyfG51bGwpID0+XG4gICAgICAgICAgdm9pZCkge1xuICAgIGxldCBuZXh0SXQgPSB0aGlzLl9pdEhlYWQ7XG4gICAgbGV0IG5leHRSZW1vdmUgPSB0aGlzLl9yZW1vdmFsc0hlYWQ7XG4gICAgbGV0IGFkZFJlbW92ZU9mZnNldCA9IDA7XG4gICAgbGV0IG1vdmVPZmZzZXRzOiBudW1iZXJbXXxudWxsID0gbnVsbDtcbiAgICB3aGlsZSAobmV4dEl0IHx8IG5leHRSZW1vdmUpIHtcbiAgICAgIC8vIEZpZ3VyZSBvdXQgd2hpY2ggaXMgdGhlIG5leHQgcmVjb3JkIHRvIHByb2Nlc3NcbiAgICAgIC8vIE9yZGVyOiByZW1vdmUsIGFkZCwgbW92ZVxuICAgICAgY29uc3QgcmVjb3JkOiBJdGVyYWJsZUNoYW5nZVJlY29yZDxWPiA9ICFuZXh0UmVtb3ZlIHx8XG4gICAgICAgICAgICAgIG5leHRJdCAmJlxuICAgICAgICAgICAgICAgICAgbmV4dEl0LmN1cnJlbnRJbmRleCAhIDxcbiAgICAgICAgICAgICAgICAgICAgICBnZXRQcmV2aW91c0luZGV4KG5leHRSZW1vdmUsIGFkZFJlbW92ZU9mZnNldCwgbW92ZU9mZnNldHMpID9cbiAgICAgICAgICBuZXh0SXQgISA6XG4gICAgICAgICAgbmV4dFJlbW92ZTtcbiAgICAgIGNvbnN0IGFkalByZXZpb3VzSW5kZXggPSBnZXRQcmV2aW91c0luZGV4KHJlY29yZCwgYWRkUmVtb3ZlT2Zmc2V0LCBtb3ZlT2Zmc2V0cyk7XG4gICAgICBjb25zdCBjdXJyZW50SW5kZXggPSByZWNvcmQuY3VycmVudEluZGV4O1xuXG4gICAgICAvLyBjb25zdW1lIHRoZSBpdGVtLCBhbmQgYWRqdXN0IHRoZSBhZGRSZW1vdmVPZmZzZXQgYW5kIHVwZGF0ZSBtb3ZlRGlzdGFuY2UgaWYgbmVjZXNzYXJ5XG4gICAgICBpZiAocmVjb3JkID09PSBuZXh0UmVtb3ZlKSB7XG4gICAgICAgIGFkZFJlbW92ZU9mZnNldC0tO1xuICAgICAgICBuZXh0UmVtb3ZlID0gbmV4dFJlbW92ZS5fbmV4dFJlbW92ZWQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBuZXh0SXQgPSBuZXh0SXQgIS5fbmV4dDtcbiAgICAgICAgaWYgKHJlY29yZC5wcmV2aW91c0luZGV4ID09IG51bGwpIHtcbiAgICAgICAgICBhZGRSZW1vdmVPZmZzZXQrKztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBJTlZBUklBTlQ6ICBjdXJyZW50SW5kZXggPCBwcmV2aW91c0luZGV4XG4gICAgICAgICAgaWYgKCFtb3ZlT2Zmc2V0cykgbW92ZU9mZnNldHMgPSBbXTtcbiAgICAgICAgICBjb25zdCBsb2NhbE1vdmVQcmV2aW91c0luZGV4ID0gYWRqUHJldmlvdXNJbmRleCAtIGFkZFJlbW92ZU9mZnNldDtcbiAgICAgICAgICBjb25zdCBsb2NhbEN1cnJlbnRJbmRleCA9IGN1cnJlbnRJbmRleCAhIC0gYWRkUmVtb3ZlT2Zmc2V0O1xuICAgICAgICAgIGlmIChsb2NhbE1vdmVQcmV2aW91c0luZGV4ICE9IGxvY2FsQ3VycmVudEluZGV4KSB7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxvY2FsTW92ZVByZXZpb3VzSW5kZXg7IGkrKykge1xuICAgICAgICAgICAgICBjb25zdCBvZmZzZXQgPSBpIDwgbW92ZU9mZnNldHMubGVuZ3RoID8gbW92ZU9mZnNldHNbaV0gOiAobW92ZU9mZnNldHNbaV0gPSAwKTtcbiAgICAgICAgICAgICAgY29uc3QgaW5kZXggPSBvZmZzZXQgKyBpO1xuICAgICAgICAgICAgICBpZiAobG9jYWxDdXJyZW50SW5kZXggPD0gaW5kZXggJiYgaW5kZXggPCBsb2NhbE1vdmVQcmV2aW91c0luZGV4KSB7XG4gICAgICAgICAgICAgICAgbW92ZU9mZnNldHNbaV0gPSBvZmZzZXQgKyAxO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBwcmV2aW91c0luZGV4ID0gcmVjb3JkLnByZXZpb3VzSW5kZXg7XG4gICAgICAgICAgICBtb3ZlT2Zmc2V0c1twcmV2aW91c0luZGV4XSA9IGxvY2FsQ3VycmVudEluZGV4IC0gbG9jYWxNb3ZlUHJldmlvdXNJbmRleDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGFkalByZXZpb3VzSW5kZXggIT09IGN1cnJlbnRJbmRleCkge1xuICAgICAgICBmbihyZWNvcmQsIGFkalByZXZpb3VzSW5kZXgsIGN1cnJlbnRJbmRleCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZm9yRWFjaFByZXZpb3VzSXRlbShmbjogKHJlY29yZDogSXRlcmFibGVDaGFuZ2VSZWNvcmRfPFY+KSA9PiB2b2lkKSB7XG4gICAgbGV0IHJlY29yZDogSXRlcmFibGVDaGFuZ2VSZWNvcmRfPFY+fG51bGw7XG4gICAgZm9yIChyZWNvcmQgPSB0aGlzLl9wcmV2aW91c0l0SGVhZDsgcmVjb3JkICE9PSBudWxsOyByZWNvcmQgPSByZWNvcmQuX25leHRQcmV2aW91cykge1xuICAgICAgZm4ocmVjb3JkKTtcbiAgICB9XG4gIH1cblxuICBmb3JFYWNoQWRkZWRJdGVtKGZuOiAocmVjb3JkOiBJdGVyYWJsZUNoYW5nZVJlY29yZF88Vj4pID0+IHZvaWQpIHtcbiAgICBsZXQgcmVjb3JkOiBJdGVyYWJsZUNoYW5nZVJlY29yZF88Vj58bnVsbDtcbiAgICBmb3IgKHJlY29yZCA9IHRoaXMuX2FkZGl0aW9uc0hlYWQ7IHJlY29yZCAhPT0gbnVsbDsgcmVjb3JkID0gcmVjb3JkLl9uZXh0QWRkZWQpIHtcbiAgICAgIGZuKHJlY29yZCk7XG4gICAgfVxuICB9XG5cbiAgZm9yRWFjaE1vdmVkSXRlbShmbjogKHJlY29yZDogSXRlcmFibGVDaGFuZ2VSZWNvcmRfPFY+KSA9PiB2b2lkKSB7XG4gICAgbGV0IHJlY29yZDogSXRlcmFibGVDaGFuZ2VSZWNvcmRfPFY+fG51bGw7XG4gICAgZm9yIChyZWNvcmQgPSB0aGlzLl9tb3Zlc0hlYWQ7IHJlY29yZCAhPT0gbnVsbDsgcmVjb3JkID0gcmVjb3JkLl9uZXh0TW92ZWQpIHtcbiAgICAgIGZuKHJlY29yZCk7XG4gICAgfVxuICB9XG5cbiAgZm9yRWFjaFJlbW92ZWRJdGVtKGZuOiAocmVjb3JkOiBJdGVyYWJsZUNoYW5nZVJlY29yZF88Vj4pID0+IHZvaWQpIHtcbiAgICBsZXQgcmVjb3JkOiBJdGVyYWJsZUNoYW5nZVJlY29yZF88Vj58bnVsbDtcbiAgICBmb3IgKHJlY29yZCA9IHRoaXMuX3JlbW92YWxzSGVhZDsgcmVjb3JkICE9PSBudWxsOyByZWNvcmQgPSByZWNvcmQuX25leHRSZW1vdmVkKSB7XG4gICAgICBmbihyZWNvcmQpO1xuICAgIH1cbiAgfVxuXG4gIGZvckVhY2hJZGVudGl0eUNoYW5nZShmbjogKHJlY29yZDogSXRlcmFibGVDaGFuZ2VSZWNvcmRfPFY+KSA9PiB2b2lkKSB7XG4gICAgbGV0IHJlY29yZDogSXRlcmFibGVDaGFuZ2VSZWNvcmRfPFY+fG51bGw7XG4gICAgZm9yIChyZWNvcmQgPSB0aGlzLl9pZGVudGl0eUNoYW5nZXNIZWFkOyByZWNvcmQgIT09IG51bGw7IHJlY29yZCA9IHJlY29yZC5fbmV4dElkZW50aXR5Q2hhbmdlKSB7XG4gICAgICBmbihyZWNvcmQpO1xuICAgIH1cbiAgfVxuXG4gIGRpZmYoY29sbGVjdGlvbjogTmdJdGVyYWJsZTxWPik6IERlZmF1bHRJdGVyYWJsZURpZmZlcjxWPnxudWxsIHtcbiAgICBpZiAoY29sbGVjdGlvbiA9PSBudWxsKSBjb2xsZWN0aW9uID0gW107XG4gICAgaWYgKCFpc0xpc3RMaWtlSXRlcmFibGUoY29sbGVjdGlvbikpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgRXJyb3IgdHJ5aW5nIHRvIGRpZmYgJyR7c3RyaW5naWZ5KGNvbGxlY3Rpb24pfScuIE9ubHkgYXJyYXlzIGFuZCBpdGVyYWJsZXMgYXJlIGFsbG93ZWRgKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5jaGVjayhjb2xsZWN0aW9uKSkge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIG9uRGVzdHJveSgpIHt9XG5cbiAgY2hlY2soY29sbGVjdGlvbjogTmdJdGVyYWJsZTxWPik6IGJvb2xlYW4ge1xuICAgIHRoaXMuX3Jlc2V0KCk7XG5cbiAgICBsZXQgcmVjb3JkOiBJdGVyYWJsZUNoYW5nZVJlY29yZF88Vj58bnVsbCA9IHRoaXMuX2l0SGVhZDtcbiAgICBsZXQgbWF5QmVEaXJ0eTogYm9vbGVhbiA9IGZhbHNlO1xuICAgIGxldCBpbmRleDogbnVtYmVyO1xuICAgIGxldCBpdGVtOiBWO1xuICAgIGxldCBpdGVtVHJhY2tCeTogYW55O1xuICAgIGlmIChBcnJheS5pc0FycmF5KGNvbGxlY3Rpb24pKSB7XG4gICAgICAodGhpcyBhc3tsZW5ndGg6IG51bWJlcn0pLmxlbmd0aCA9IGNvbGxlY3Rpb24ubGVuZ3RoO1xuXG4gICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgdGhpcy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgaXRlbSA9IGNvbGxlY3Rpb25baW5kZXhdO1xuICAgICAgICBpdGVtVHJhY2tCeSA9IHRoaXMuX3RyYWNrQnlGbihpbmRleCwgaXRlbSk7XG4gICAgICAgIGlmIChyZWNvcmQgPT09IG51bGwgfHwgIWxvb3NlSWRlbnRpY2FsKHJlY29yZC50cmFja0J5SWQsIGl0ZW1UcmFja0J5KSkge1xuICAgICAgICAgIHJlY29yZCA9IHRoaXMuX21pc21hdGNoKHJlY29yZCwgaXRlbSwgaXRlbVRyYWNrQnksIGluZGV4KTtcbiAgICAgICAgICBtYXlCZURpcnR5ID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAobWF5QmVEaXJ0eSkge1xuICAgICAgICAgICAgLy8gVE9ETyhtaXNrbyk6IGNhbiB3ZSBsaW1pdCB0aGlzIHRvIGR1cGxpY2F0ZXMgb25seT9cbiAgICAgICAgICAgIHJlY29yZCA9IHRoaXMuX3ZlcmlmeVJlaW5zZXJ0aW9uKHJlY29yZCwgaXRlbSwgaXRlbVRyYWNrQnksIGluZGV4KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCFsb29zZUlkZW50aWNhbChyZWNvcmQuaXRlbSwgaXRlbSkpIHRoaXMuX2FkZElkZW50aXR5Q2hhbmdlKHJlY29yZCwgaXRlbSk7XG4gICAgICAgIH1cblxuICAgICAgICByZWNvcmQgPSByZWNvcmQuX25leHQ7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGluZGV4ID0gMDtcbiAgICAgIGl0ZXJhdGVMaXN0TGlrZShjb2xsZWN0aW9uLCAoaXRlbTogVikgPT4ge1xuICAgICAgICBpdGVtVHJhY2tCeSA9IHRoaXMuX3RyYWNrQnlGbihpbmRleCwgaXRlbSk7XG4gICAgICAgIGlmIChyZWNvcmQgPT09IG51bGwgfHwgIWxvb3NlSWRlbnRpY2FsKHJlY29yZC50cmFja0J5SWQsIGl0ZW1UcmFja0J5KSkge1xuICAgICAgICAgIHJlY29yZCA9IHRoaXMuX21pc21hdGNoKHJlY29yZCwgaXRlbSwgaXRlbVRyYWNrQnksIGluZGV4KTtcbiAgICAgICAgICBtYXlCZURpcnR5ID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAobWF5QmVEaXJ0eSkge1xuICAgICAgICAgICAgLy8gVE9ETyhtaXNrbyk6IGNhbiB3ZSBsaW1pdCB0aGlzIHRvIGR1cGxpY2F0ZXMgb25seT9cbiAgICAgICAgICAgIHJlY29yZCA9IHRoaXMuX3ZlcmlmeVJlaW5zZXJ0aW9uKHJlY29yZCwgaXRlbSwgaXRlbVRyYWNrQnksIGluZGV4KTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCFsb29zZUlkZW50aWNhbChyZWNvcmQuaXRlbSwgaXRlbSkpIHRoaXMuX2FkZElkZW50aXR5Q2hhbmdlKHJlY29yZCwgaXRlbSk7XG4gICAgICAgIH1cbiAgICAgICAgcmVjb3JkID0gcmVjb3JkLl9uZXh0O1xuICAgICAgICBpbmRleCsrO1xuICAgICAgfSk7XG4gICAgICAodGhpcyBhc3tsZW5ndGg6IG51bWJlcn0pLmxlbmd0aCA9IGluZGV4O1xuICAgIH1cblxuICAgIHRoaXMuX3RydW5jYXRlKHJlY29yZCk7XG4gICAgKHRoaXMgYXN7Y29sbGVjdGlvbjogVltdIHwgSXRlcmFibGU8Vj59KS5jb2xsZWN0aW9uID0gY29sbGVjdGlvbjtcbiAgICByZXR1cm4gdGhpcy5pc0RpcnR5O1xuICB9XG5cbiAgLyogQ29sbGVjdGlvbkNoYW5nZXMgaXMgY29uc2lkZXJlZCBkaXJ0eSBpZiBpdCBoYXMgYW55IGFkZGl0aW9ucywgbW92ZXMsIHJlbW92YWxzLCBvciBpZGVudGl0eVxuICAgKiBjaGFuZ2VzLlxuICAgKi9cbiAgZ2V0IGlzRGlydHkoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuX2FkZGl0aW9uc0hlYWQgIT09IG51bGwgfHwgdGhpcy5fbW92ZXNIZWFkICE9PSBudWxsIHx8XG4gICAgICAgIHRoaXMuX3JlbW92YWxzSGVhZCAhPT0gbnVsbCB8fCB0aGlzLl9pZGVudGl0eUNoYW5nZXNIZWFkICE9PSBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlc2V0IHRoZSBzdGF0ZSBvZiB0aGUgY2hhbmdlIG9iamVjdHMgdG8gc2hvdyBubyBjaGFuZ2VzLiBUaGlzIG1lYW5zIHNldCBwcmV2aW91c0tleSB0b1xuICAgKiBjdXJyZW50S2V5LCBhbmQgY2xlYXIgYWxsIG9mIHRoZSBxdWV1ZXMgKGFkZGl0aW9ucywgbW92ZXMsIHJlbW92YWxzKS5cbiAgICogU2V0IHRoZSBwcmV2aW91c0luZGV4ZXMgb2YgbW92ZWQgYW5kIGFkZGVkIGl0ZW1zIHRvIHRoZWlyIGN1cnJlbnRJbmRleGVzXG4gICAqIFJlc2V0IHRoZSBsaXN0IG9mIGFkZGl0aW9ucywgbW92ZXMgYW5kIHJlbW92YWxzXG4gICAqXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgX3Jlc2V0KCkge1xuICAgIGlmICh0aGlzLmlzRGlydHkpIHtcbiAgICAgIGxldCByZWNvcmQ6IEl0ZXJhYmxlQ2hhbmdlUmVjb3JkXzxWPnxudWxsO1xuICAgICAgbGV0IG5leHRSZWNvcmQ6IEl0ZXJhYmxlQ2hhbmdlUmVjb3JkXzxWPnxudWxsO1xuXG4gICAgICBmb3IgKHJlY29yZCA9IHRoaXMuX3ByZXZpb3VzSXRIZWFkID0gdGhpcy5faXRIZWFkOyByZWNvcmQgIT09IG51bGw7IHJlY29yZCA9IHJlY29yZC5fbmV4dCkge1xuICAgICAgICByZWNvcmQuX25leHRQcmV2aW91cyA9IHJlY29yZC5fbmV4dDtcbiAgICAgIH1cblxuICAgICAgZm9yIChyZWNvcmQgPSB0aGlzLl9hZGRpdGlvbnNIZWFkOyByZWNvcmQgIT09IG51bGw7IHJlY29yZCA9IHJlY29yZC5fbmV4dEFkZGVkKSB7XG4gICAgICAgIHJlY29yZC5wcmV2aW91c0luZGV4ID0gcmVjb3JkLmN1cnJlbnRJbmRleDtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2FkZGl0aW9uc0hlYWQgPSB0aGlzLl9hZGRpdGlvbnNUYWlsID0gbnVsbDtcblxuICAgICAgZm9yIChyZWNvcmQgPSB0aGlzLl9tb3Zlc0hlYWQ7IHJlY29yZCAhPT0gbnVsbDsgcmVjb3JkID0gbmV4dFJlY29yZCkge1xuICAgICAgICByZWNvcmQucHJldmlvdXNJbmRleCA9IHJlY29yZC5jdXJyZW50SW5kZXg7XG4gICAgICAgIG5leHRSZWNvcmQgPSByZWNvcmQuX25leHRNb3ZlZDtcbiAgICAgIH1cbiAgICAgIHRoaXMuX21vdmVzSGVhZCA9IHRoaXMuX21vdmVzVGFpbCA9IG51bGw7XG4gICAgICB0aGlzLl9yZW1vdmFsc0hlYWQgPSB0aGlzLl9yZW1vdmFsc1RhaWwgPSBudWxsO1xuICAgICAgdGhpcy5faWRlbnRpdHlDaGFuZ2VzSGVhZCA9IHRoaXMuX2lkZW50aXR5Q2hhbmdlc1RhaWwgPSBudWxsO1xuXG4gICAgICAvLyBUT0RPKHZpY2IpOiB3aGVuIGFzc2VydCBnZXRzIHN1cHBvcnRlZFxuICAgICAgLy8gYXNzZXJ0KCF0aGlzLmlzRGlydHkpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIGlzIHRoZSBjb3JlIGZ1bmN0aW9uIHdoaWNoIGhhbmRsZXMgZGlmZmVyZW5jZXMgYmV0d2VlbiBjb2xsZWN0aW9ucy5cbiAgICpcbiAgICogLSBgcmVjb3JkYCBpcyB0aGUgcmVjb3JkIHdoaWNoIHdlIHNhdyBhdCB0aGlzIHBvc2l0aW9uIGxhc3QgdGltZS4gSWYgbnVsbCB0aGVuIGl0IGlzIGEgbmV3XG4gICAqICAgaXRlbS5cbiAgICogLSBgaXRlbWAgaXMgdGhlIGN1cnJlbnQgaXRlbSBpbiB0aGUgY29sbGVjdGlvblxuICAgKiAtIGBpbmRleGAgaXMgdGhlIHBvc2l0aW9uIG9mIHRoZSBpdGVtIGluIHRoZSBjb2xsZWN0aW9uXG4gICAqXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgX21pc21hdGNoKHJlY29yZDogSXRlcmFibGVDaGFuZ2VSZWNvcmRfPFY+fG51bGwsIGl0ZW06IFYsIGl0ZW1UcmFja0J5OiBhbnksIGluZGV4OiBudW1iZXIpOlxuICAgICAgSXRlcmFibGVDaGFuZ2VSZWNvcmRfPFY+IHtcbiAgICAvLyBUaGUgcHJldmlvdXMgcmVjb3JkIGFmdGVyIHdoaWNoIHdlIHdpbGwgYXBwZW5kIHRoZSBjdXJyZW50IG9uZS5cbiAgICBsZXQgcHJldmlvdXNSZWNvcmQ6IEl0ZXJhYmxlQ2hhbmdlUmVjb3JkXzxWPnxudWxsO1xuXG4gICAgaWYgKHJlY29yZCA9PT0gbnVsbCkge1xuICAgICAgcHJldmlvdXNSZWNvcmQgPSB0aGlzLl9pdFRhaWw7XG4gICAgfSBlbHNlIHtcbiAgICAgIHByZXZpb3VzUmVjb3JkID0gcmVjb3JkLl9wcmV2O1xuICAgICAgLy8gUmVtb3ZlIHRoZSByZWNvcmQgZnJvbSB0aGUgY29sbGVjdGlvbiBzaW5jZSB3ZSBrbm93IGl0IGRvZXMgbm90IG1hdGNoIHRoZSBpdGVtLlxuICAgICAgdGhpcy5fcmVtb3ZlKHJlY29yZCk7XG4gICAgfVxuXG4gICAgLy8gQXR0ZW1wdCB0byBzZWUgaWYgd2UgaGF2ZSBzZWVuIHRoZSBpdGVtIGJlZm9yZS5cbiAgICByZWNvcmQgPSB0aGlzLl9saW5rZWRSZWNvcmRzID09PSBudWxsID8gbnVsbCA6IHRoaXMuX2xpbmtlZFJlY29yZHMuZ2V0KGl0ZW1UcmFja0J5LCBpbmRleCk7XG4gICAgaWYgKHJlY29yZCAhPT0gbnVsbCkge1xuICAgICAgLy8gV2UgaGF2ZSBzZWVuIHRoaXMgYmVmb3JlLCB3ZSBuZWVkIHRvIG1vdmUgaXQgZm9yd2FyZCBpbiB0aGUgY29sbGVjdGlvbi5cbiAgICAgIC8vIEJ1dCBmaXJzdCB3ZSBuZWVkIHRvIGNoZWNrIGlmIGlkZW50aXR5IGNoYW5nZWQsIHNvIHdlIGNhbiB1cGRhdGUgaW4gdmlldyBpZiBuZWNlc3NhcnlcbiAgICAgIGlmICghbG9vc2VJZGVudGljYWwocmVjb3JkLml0ZW0sIGl0ZW0pKSB0aGlzLl9hZGRJZGVudGl0eUNoYW5nZShyZWNvcmQsIGl0ZW0pO1xuXG4gICAgICB0aGlzLl9tb3ZlQWZ0ZXIocmVjb3JkLCBwcmV2aW91c1JlY29yZCwgaW5kZXgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBOZXZlciBzZWVuIGl0LCBjaGVjayBldmljdGVkIGxpc3QuXG4gICAgICByZWNvcmQgPSB0aGlzLl91bmxpbmtlZFJlY29yZHMgPT09IG51bGwgPyBudWxsIDogdGhpcy5fdW5saW5rZWRSZWNvcmRzLmdldChpdGVtVHJhY2tCeSwgbnVsbCk7XG4gICAgICBpZiAocmVjb3JkICE9PSBudWxsKSB7XG4gICAgICAgIC8vIEl0IGlzIGFuIGl0ZW0gd2hpY2ggd2UgaGF2ZSBldmljdGVkIGVhcmxpZXI6IHJlaW5zZXJ0IGl0IGJhY2sgaW50byB0aGUgbGlzdC5cbiAgICAgICAgLy8gQnV0IGZpcnN0IHdlIG5lZWQgdG8gY2hlY2sgaWYgaWRlbnRpdHkgY2hhbmdlZCwgc28gd2UgY2FuIHVwZGF0ZSBpbiB2aWV3IGlmIG5lY2Vzc2FyeVxuICAgICAgICBpZiAoIWxvb3NlSWRlbnRpY2FsKHJlY29yZC5pdGVtLCBpdGVtKSkgdGhpcy5fYWRkSWRlbnRpdHlDaGFuZ2UocmVjb3JkLCBpdGVtKTtcblxuICAgICAgICB0aGlzLl9yZWluc2VydEFmdGVyKHJlY29yZCwgcHJldmlvdXNSZWNvcmQsIGluZGV4KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIEl0IGlzIGEgbmV3IGl0ZW06IGFkZCBpdC5cbiAgICAgICAgcmVjb3JkID1cbiAgICAgICAgICAgIHRoaXMuX2FkZEFmdGVyKG5ldyBJdGVyYWJsZUNoYW5nZVJlY29yZF88Vj4oaXRlbSwgaXRlbVRyYWNrQnkpLCBwcmV2aW91c1JlY29yZCwgaW5kZXgpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVjb3JkO1xuICB9XG5cbiAgLyoqXG4gICAqIFRoaXMgY2hlY2sgaXMgb25seSBuZWVkZWQgaWYgYW4gYXJyYXkgY29udGFpbnMgZHVwbGljYXRlcy4gKFNob3J0IGNpcmN1aXQgb2Ygbm90aGluZyBkaXJ0eSlcbiAgICpcbiAgICogVXNlIGNhc2U6IGBbYSwgYV1gID0+IGBbYiwgYSwgYV1gXG4gICAqXG4gICAqIElmIHdlIGRpZCBub3QgaGF2ZSB0aGlzIGNoZWNrIHRoZW4gdGhlIGluc2VydGlvbiBvZiBgYmAgd291bGQ6XG4gICAqICAgMSkgZXZpY3QgZmlyc3QgYGFgXG4gICAqICAgMikgaW5zZXJ0IGBiYCBhdCBgMGAgaW5kZXguXG4gICAqICAgMykgbGVhdmUgYGFgIGF0IGluZGV4IGAxYCBhcyBpcy4gPC0tIHRoaXMgaXMgd3JvbmchXG4gICAqICAgMykgcmVpbnNlcnQgYGFgIGF0IGluZGV4IDIuIDwtLSB0aGlzIGlzIHdyb25nIVxuICAgKlxuICAgKiBUaGUgY29ycmVjdCBiZWhhdmlvciBpczpcbiAgICogICAxKSBldmljdCBmaXJzdCBgYWBcbiAgICogICAyKSBpbnNlcnQgYGJgIGF0IGAwYCBpbmRleC5cbiAgICogICAzKSByZWluc2VydCBgYWAgYXQgaW5kZXggMS5cbiAgICogICAzKSBtb3ZlIGBhYCBhdCBmcm9tIGAxYCB0byBgMmAuXG4gICAqXG4gICAqXG4gICAqIERvdWJsZSBjaGVjayB0aGF0IHdlIGhhdmUgbm90IGV2aWN0ZWQgYSBkdXBsaWNhdGUgaXRlbS4gV2UgbmVlZCB0byBjaGVjayBpZiB0aGUgaXRlbSB0eXBlIG1heVxuICAgKiBoYXZlIGFscmVhZHkgYmVlbiByZW1vdmVkOlxuICAgKiBUaGUgaW5zZXJ0aW9uIG9mIGIgd2lsbCBldmljdCB0aGUgZmlyc3QgJ2EnLiBJZiB3ZSBkb24ndCByZWluc2VydCBpdCBub3cgaXQgd2lsbCBiZSByZWluc2VydGVkXG4gICAqIGF0IHRoZSBlbmQuIFdoaWNoIHdpbGwgc2hvdyB1cCBhcyB0aGUgdHdvICdhJ3Mgc3dpdGNoaW5nIHBvc2l0aW9uLiBUaGlzIGlzIGluY29ycmVjdCwgc2luY2UgYVxuICAgKiBiZXR0ZXIgd2F5IHRvIHRoaW5rIG9mIGl0IGlzIGFzIGluc2VydCBvZiAnYicgcmF0aGVyIHRoZW4gc3dpdGNoICdhJyB3aXRoICdiJyBhbmQgdGhlbiBhZGQgJ2EnXG4gICAqIGF0IHRoZSBlbmQuXG4gICAqXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgX3ZlcmlmeVJlaW5zZXJ0aW9uKHJlY29yZDogSXRlcmFibGVDaGFuZ2VSZWNvcmRfPFY+LCBpdGVtOiBWLCBpdGVtVHJhY2tCeTogYW55LCBpbmRleDogbnVtYmVyKTpcbiAgICAgIEl0ZXJhYmxlQ2hhbmdlUmVjb3JkXzxWPiB7XG4gICAgbGV0IHJlaW5zZXJ0UmVjb3JkOiBJdGVyYWJsZUNoYW5nZVJlY29yZF88Vj58bnVsbCA9XG4gICAgICAgIHRoaXMuX3VubGlua2VkUmVjb3JkcyA9PT0gbnVsbCA/IG51bGwgOiB0aGlzLl91bmxpbmtlZFJlY29yZHMuZ2V0KGl0ZW1UcmFja0J5LCBudWxsKTtcbiAgICBpZiAocmVpbnNlcnRSZWNvcmQgIT09IG51bGwpIHtcbiAgICAgIHJlY29yZCA9IHRoaXMuX3JlaW5zZXJ0QWZ0ZXIocmVpbnNlcnRSZWNvcmQsIHJlY29yZC5fcHJldiAhLCBpbmRleCk7XG4gICAgfSBlbHNlIGlmIChyZWNvcmQuY3VycmVudEluZGV4ICE9IGluZGV4KSB7XG4gICAgICByZWNvcmQuY3VycmVudEluZGV4ID0gaW5kZXg7XG4gICAgICB0aGlzLl9hZGRUb01vdmVzKHJlY29yZCwgaW5kZXgpO1xuICAgIH1cbiAgICByZXR1cm4gcmVjb3JkO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldCByaWQgb2YgYW55IGV4Y2VzcyB7QGxpbmsgSXRlcmFibGVDaGFuZ2VSZWNvcmRffXMgZnJvbSB0aGUgcHJldmlvdXMgY29sbGVjdGlvblxuICAgKlxuICAgKiAtIGByZWNvcmRgIFRoZSBmaXJzdCBleGNlc3Mge0BsaW5rIEl0ZXJhYmxlQ2hhbmdlUmVjb3JkX30uXG4gICAqXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgX3RydW5jYXRlKHJlY29yZDogSXRlcmFibGVDaGFuZ2VSZWNvcmRfPFY+fG51bGwpIHtcbiAgICAvLyBBbnl0aGluZyBhZnRlciB0aGF0IG5lZWRzIHRvIGJlIHJlbW92ZWQ7XG4gICAgd2hpbGUgKHJlY29yZCAhPT0gbnVsbCkge1xuICAgICAgY29uc3QgbmV4dFJlY29yZDogSXRlcmFibGVDaGFuZ2VSZWNvcmRfPFY+fG51bGwgPSByZWNvcmQuX25leHQ7XG4gICAgICB0aGlzLl9hZGRUb1JlbW92YWxzKHRoaXMuX3VubGluayhyZWNvcmQpKTtcbiAgICAgIHJlY29yZCA9IG5leHRSZWNvcmQ7XG4gICAgfVxuICAgIGlmICh0aGlzLl91bmxpbmtlZFJlY29yZHMgIT09IG51bGwpIHtcbiAgICAgIHRoaXMuX3VubGlua2VkUmVjb3Jkcy5jbGVhcigpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9hZGRpdGlvbnNUYWlsICE9PSBudWxsKSB7XG4gICAgICB0aGlzLl9hZGRpdGlvbnNUYWlsLl9uZXh0QWRkZWQgPSBudWxsO1xuICAgIH1cbiAgICBpZiAodGhpcy5fbW92ZXNUYWlsICE9PSBudWxsKSB7XG4gICAgICB0aGlzLl9tb3Zlc1RhaWwuX25leHRNb3ZlZCA9IG51bGw7XG4gICAgfVxuICAgIGlmICh0aGlzLl9pdFRhaWwgIT09IG51bGwpIHtcbiAgICAgIHRoaXMuX2l0VGFpbC5fbmV4dCA9IG51bGw7XG4gICAgfVxuICAgIGlmICh0aGlzLl9yZW1vdmFsc1RhaWwgIT09IG51bGwpIHtcbiAgICAgIHRoaXMuX3JlbW92YWxzVGFpbC5fbmV4dFJlbW92ZWQgPSBudWxsO1xuICAgIH1cbiAgICBpZiAodGhpcy5faWRlbnRpdHlDaGFuZ2VzVGFpbCAhPT0gbnVsbCkge1xuICAgICAgdGhpcy5faWRlbnRpdHlDaGFuZ2VzVGFpbC5fbmV4dElkZW50aXR5Q2hhbmdlID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9yZWluc2VydEFmdGVyKFxuICAgICAgcmVjb3JkOiBJdGVyYWJsZUNoYW5nZVJlY29yZF88Vj4sIHByZXZSZWNvcmQ6IEl0ZXJhYmxlQ2hhbmdlUmVjb3JkXzxWPnxudWxsLFxuICAgICAgaW5kZXg6IG51bWJlcik6IEl0ZXJhYmxlQ2hhbmdlUmVjb3JkXzxWPiB7XG4gICAgaWYgKHRoaXMuX3VubGlua2VkUmVjb3JkcyAhPT0gbnVsbCkge1xuICAgICAgdGhpcy5fdW5saW5rZWRSZWNvcmRzLnJlbW92ZShyZWNvcmQpO1xuICAgIH1cbiAgICBjb25zdCBwcmV2ID0gcmVjb3JkLl9wcmV2UmVtb3ZlZDtcbiAgICBjb25zdCBuZXh0ID0gcmVjb3JkLl9uZXh0UmVtb3ZlZDtcblxuICAgIGlmIChwcmV2ID09PSBudWxsKSB7XG4gICAgICB0aGlzLl9yZW1vdmFsc0hlYWQgPSBuZXh0O1xuICAgIH0gZWxzZSB7XG4gICAgICBwcmV2Ll9uZXh0UmVtb3ZlZCA9IG5leHQ7XG4gICAgfVxuICAgIGlmIChuZXh0ID09PSBudWxsKSB7XG4gICAgICB0aGlzLl9yZW1vdmFsc1RhaWwgPSBwcmV2O1xuICAgIH0gZWxzZSB7XG4gICAgICBuZXh0Ll9wcmV2UmVtb3ZlZCA9IHByZXY7XG4gICAgfVxuXG4gICAgdGhpcy5faW5zZXJ0QWZ0ZXIocmVjb3JkLCBwcmV2UmVjb3JkLCBpbmRleCk7XG4gICAgdGhpcy5fYWRkVG9Nb3ZlcyhyZWNvcmQsIGluZGV4KTtcbiAgICByZXR1cm4gcmVjb3JkO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfbW92ZUFmdGVyKFxuICAgICAgcmVjb3JkOiBJdGVyYWJsZUNoYW5nZVJlY29yZF88Vj4sIHByZXZSZWNvcmQ6IEl0ZXJhYmxlQ2hhbmdlUmVjb3JkXzxWPnxudWxsLFxuICAgICAgaW5kZXg6IG51bWJlcik6IEl0ZXJhYmxlQ2hhbmdlUmVjb3JkXzxWPiB7XG4gICAgdGhpcy5fdW5saW5rKHJlY29yZCk7XG4gICAgdGhpcy5faW5zZXJ0QWZ0ZXIocmVjb3JkLCBwcmV2UmVjb3JkLCBpbmRleCk7XG4gICAgdGhpcy5fYWRkVG9Nb3ZlcyhyZWNvcmQsIGluZGV4KTtcbiAgICByZXR1cm4gcmVjb3JkO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfYWRkQWZ0ZXIoXG4gICAgICByZWNvcmQ6IEl0ZXJhYmxlQ2hhbmdlUmVjb3JkXzxWPiwgcHJldlJlY29yZDogSXRlcmFibGVDaGFuZ2VSZWNvcmRfPFY+fG51bGwsXG4gICAgICBpbmRleDogbnVtYmVyKTogSXRlcmFibGVDaGFuZ2VSZWNvcmRfPFY+IHtcbiAgICB0aGlzLl9pbnNlcnRBZnRlcihyZWNvcmQsIHByZXZSZWNvcmQsIGluZGV4KTtcblxuICAgIGlmICh0aGlzLl9hZGRpdGlvbnNUYWlsID09PSBudWxsKSB7XG4gICAgICAvLyBUT0RPKHZpY2IpOlxuICAgICAgLy8gYXNzZXJ0KHRoaXMuX2FkZGl0aW9uc0hlYWQgPT09IG51bGwpO1xuICAgICAgdGhpcy5fYWRkaXRpb25zVGFpbCA9IHRoaXMuX2FkZGl0aW9uc0hlYWQgPSByZWNvcmQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFRPRE8odmljYik6XG4gICAgICAvLyBhc3NlcnQoX2FkZGl0aW9uc1RhaWwuX25leHRBZGRlZCA9PT0gbnVsbCk7XG4gICAgICAvLyBhc3NlcnQocmVjb3JkLl9uZXh0QWRkZWQgPT09IG51bGwpO1xuICAgICAgdGhpcy5fYWRkaXRpb25zVGFpbCA9IHRoaXMuX2FkZGl0aW9uc1RhaWwuX25leHRBZGRlZCA9IHJlY29yZDtcbiAgICB9XG4gICAgcmV0dXJuIHJlY29yZDtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2luc2VydEFmdGVyKFxuICAgICAgcmVjb3JkOiBJdGVyYWJsZUNoYW5nZVJlY29yZF88Vj4sIHByZXZSZWNvcmQ6IEl0ZXJhYmxlQ2hhbmdlUmVjb3JkXzxWPnxudWxsLFxuICAgICAgaW5kZXg6IG51bWJlcik6IEl0ZXJhYmxlQ2hhbmdlUmVjb3JkXzxWPiB7XG4gICAgLy8gVE9ETyh2aWNiKTpcbiAgICAvLyBhc3NlcnQocmVjb3JkICE9IHByZXZSZWNvcmQpO1xuICAgIC8vIGFzc2VydChyZWNvcmQuX25leHQgPT09IG51bGwpO1xuICAgIC8vIGFzc2VydChyZWNvcmQuX3ByZXYgPT09IG51bGwpO1xuXG4gICAgY29uc3QgbmV4dDogSXRlcmFibGVDaGFuZ2VSZWNvcmRfPFY+fG51bGwgPVxuICAgICAgICBwcmV2UmVjb3JkID09PSBudWxsID8gdGhpcy5faXRIZWFkIDogcHJldlJlY29yZC5fbmV4dDtcbiAgICAvLyBUT0RPKHZpY2IpOlxuICAgIC8vIGFzc2VydChuZXh0ICE9IHJlY29yZCk7XG4gICAgLy8gYXNzZXJ0KHByZXZSZWNvcmQgIT0gcmVjb3JkKTtcbiAgICByZWNvcmQuX25leHQgPSBuZXh0O1xuICAgIHJlY29yZC5fcHJldiA9IHByZXZSZWNvcmQ7XG4gICAgaWYgKG5leHQgPT09IG51bGwpIHtcbiAgICAgIHRoaXMuX2l0VGFpbCA9IHJlY29yZDtcbiAgICB9IGVsc2Uge1xuICAgICAgbmV4dC5fcHJldiA9IHJlY29yZDtcbiAgICB9XG4gICAgaWYgKHByZXZSZWNvcmQgPT09IG51bGwpIHtcbiAgICAgIHRoaXMuX2l0SGVhZCA9IHJlY29yZDtcbiAgICB9IGVsc2Uge1xuICAgICAgcHJldlJlY29yZC5fbmV4dCA9IHJlY29yZDtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fbGlua2VkUmVjb3JkcyA9PT0gbnVsbCkge1xuICAgICAgdGhpcy5fbGlua2VkUmVjb3JkcyA9IG5ldyBfRHVwbGljYXRlTWFwPFY+KCk7XG4gICAgfVxuICAgIHRoaXMuX2xpbmtlZFJlY29yZHMucHV0KHJlY29yZCk7XG5cbiAgICByZWNvcmQuY3VycmVudEluZGV4ID0gaW5kZXg7XG4gICAgcmV0dXJuIHJlY29yZDtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3JlbW92ZShyZWNvcmQ6IEl0ZXJhYmxlQ2hhbmdlUmVjb3JkXzxWPik6IEl0ZXJhYmxlQ2hhbmdlUmVjb3JkXzxWPiB7XG4gICAgcmV0dXJuIHRoaXMuX2FkZFRvUmVtb3ZhbHModGhpcy5fdW5saW5rKHJlY29yZCkpO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfdW5saW5rKHJlY29yZDogSXRlcmFibGVDaGFuZ2VSZWNvcmRfPFY+KTogSXRlcmFibGVDaGFuZ2VSZWNvcmRfPFY+IHtcbiAgICBpZiAodGhpcy5fbGlua2VkUmVjb3JkcyAhPT0gbnVsbCkge1xuICAgICAgdGhpcy5fbGlua2VkUmVjb3Jkcy5yZW1vdmUocmVjb3JkKTtcbiAgICB9XG5cbiAgICBjb25zdCBwcmV2ID0gcmVjb3JkLl9wcmV2O1xuICAgIGNvbnN0IG5leHQgPSByZWNvcmQuX25leHQ7XG5cbiAgICAvLyBUT0RPKHZpY2IpOlxuICAgIC8vIGFzc2VydCgocmVjb3JkLl9wcmV2ID0gbnVsbCkgPT09IG51bGwpO1xuICAgIC8vIGFzc2VydCgocmVjb3JkLl9uZXh0ID0gbnVsbCkgPT09IG51bGwpO1xuXG4gICAgaWYgKHByZXYgPT09IG51bGwpIHtcbiAgICAgIHRoaXMuX2l0SGVhZCA9IG5leHQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHByZXYuX25leHQgPSBuZXh0O1xuICAgIH1cbiAgICBpZiAobmV4dCA9PT0gbnVsbCkge1xuICAgICAgdGhpcy5faXRUYWlsID0gcHJldjtcbiAgICB9IGVsc2Uge1xuICAgICAgbmV4dC5fcHJldiA9IHByZXY7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlY29yZDtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX2FkZFRvTW92ZXMocmVjb3JkOiBJdGVyYWJsZUNoYW5nZVJlY29yZF88Vj4sIHRvSW5kZXg6IG51bWJlcik6IEl0ZXJhYmxlQ2hhbmdlUmVjb3JkXzxWPiB7XG4gICAgLy8gVE9ETyh2aWNiKTpcbiAgICAvLyBhc3NlcnQocmVjb3JkLl9uZXh0TW92ZWQgPT09IG51bGwpO1xuXG4gICAgaWYgKHJlY29yZC5wcmV2aW91c0luZGV4ID09PSB0b0luZGV4KSB7XG4gICAgICByZXR1cm4gcmVjb3JkO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9tb3Zlc1RhaWwgPT09IG51bGwpIHtcbiAgICAgIC8vIFRPRE8odmljYik6XG4gICAgICAvLyBhc3NlcnQoX21vdmVzSGVhZCA9PT0gbnVsbCk7XG4gICAgICB0aGlzLl9tb3Zlc1RhaWwgPSB0aGlzLl9tb3Zlc0hlYWQgPSByZWNvcmQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFRPRE8odmljYik6XG4gICAgICAvLyBhc3NlcnQoX21vdmVzVGFpbC5fbmV4dE1vdmVkID09PSBudWxsKTtcbiAgICAgIHRoaXMuX21vdmVzVGFpbCA9IHRoaXMuX21vdmVzVGFpbC5fbmV4dE1vdmVkID0gcmVjb3JkO1xuICAgIH1cblxuICAgIHJldHVybiByZWNvcmQ7XG4gIH1cblxuICBwcml2YXRlIF9hZGRUb1JlbW92YWxzKHJlY29yZDogSXRlcmFibGVDaGFuZ2VSZWNvcmRfPFY+KTogSXRlcmFibGVDaGFuZ2VSZWNvcmRfPFY+IHtcbiAgICBpZiAodGhpcy5fdW5saW5rZWRSZWNvcmRzID09PSBudWxsKSB7XG4gICAgICB0aGlzLl91bmxpbmtlZFJlY29yZHMgPSBuZXcgX0R1cGxpY2F0ZU1hcDxWPigpO1xuICAgIH1cbiAgICB0aGlzLl91bmxpbmtlZFJlY29yZHMucHV0KHJlY29yZCk7XG4gICAgcmVjb3JkLmN1cnJlbnRJbmRleCA9IG51bGw7XG4gICAgcmVjb3JkLl9uZXh0UmVtb3ZlZCA9IG51bGw7XG5cbiAgICBpZiAodGhpcy5fcmVtb3ZhbHNUYWlsID09PSBudWxsKSB7XG4gICAgICAvLyBUT0RPKHZpY2IpOlxuICAgICAgLy8gYXNzZXJ0KF9yZW1vdmFsc0hlYWQgPT09IG51bGwpO1xuICAgICAgdGhpcy5fcmVtb3ZhbHNUYWlsID0gdGhpcy5fcmVtb3ZhbHNIZWFkID0gcmVjb3JkO1xuICAgICAgcmVjb3JkLl9wcmV2UmVtb3ZlZCA9IG51bGw7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFRPRE8odmljYik6XG4gICAgICAvLyBhc3NlcnQoX3JlbW92YWxzVGFpbC5fbmV4dFJlbW92ZWQgPT09IG51bGwpO1xuICAgICAgLy8gYXNzZXJ0KHJlY29yZC5fbmV4dFJlbW92ZWQgPT09IG51bGwpO1xuICAgICAgcmVjb3JkLl9wcmV2UmVtb3ZlZCA9IHRoaXMuX3JlbW92YWxzVGFpbDtcbiAgICAgIHRoaXMuX3JlbW92YWxzVGFpbCA9IHRoaXMuX3JlbW92YWxzVGFpbC5fbmV4dFJlbW92ZWQgPSByZWNvcmQ7XG4gICAgfVxuICAgIHJldHVybiByZWNvcmQ7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9hZGRJZGVudGl0eUNoYW5nZShyZWNvcmQ6IEl0ZXJhYmxlQ2hhbmdlUmVjb3JkXzxWPiwgaXRlbTogVikge1xuICAgIHJlY29yZC5pdGVtID0gaXRlbTtcbiAgICBpZiAodGhpcy5faWRlbnRpdHlDaGFuZ2VzVGFpbCA9PT0gbnVsbCkge1xuICAgICAgdGhpcy5faWRlbnRpdHlDaGFuZ2VzVGFpbCA9IHRoaXMuX2lkZW50aXR5Q2hhbmdlc0hlYWQgPSByZWNvcmQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2lkZW50aXR5Q2hhbmdlc1RhaWwgPSB0aGlzLl9pZGVudGl0eUNoYW5nZXNUYWlsLl9uZXh0SWRlbnRpdHlDaGFuZ2UgPSByZWNvcmQ7XG4gICAgfVxuICAgIHJldHVybiByZWNvcmQ7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEl0ZXJhYmxlQ2hhbmdlUmVjb3JkXzxWPiBpbXBsZW1lbnRzIEl0ZXJhYmxlQ2hhbmdlUmVjb3JkPFY+IHtcbiAgY3VycmVudEluZGV4OiBudW1iZXJ8bnVsbCA9IG51bGw7XG4gIHByZXZpb3VzSW5kZXg6IG51bWJlcnxudWxsID0gbnVsbDtcblxuICAvKiogQGludGVybmFsICovXG4gIF9uZXh0UHJldmlvdXM6IEl0ZXJhYmxlQ2hhbmdlUmVjb3JkXzxWPnxudWxsID0gbnVsbDtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcHJldjogSXRlcmFibGVDaGFuZ2VSZWNvcmRfPFY+fG51bGwgPSBudWxsO1xuICAvKiogQGludGVybmFsICovXG4gIF9uZXh0OiBJdGVyYWJsZUNoYW5nZVJlY29yZF88Vj58bnVsbCA9IG51bGw7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3ByZXZEdXA6IEl0ZXJhYmxlQ2hhbmdlUmVjb3JkXzxWPnxudWxsID0gbnVsbDtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfbmV4dER1cDogSXRlcmFibGVDaGFuZ2VSZWNvcmRfPFY+fG51bGwgPSBudWxsO1xuICAvKiogQGludGVybmFsICovXG4gIF9wcmV2UmVtb3ZlZDogSXRlcmFibGVDaGFuZ2VSZWNvcmRfPFY+fG51bGwgPSBudWxsO1xuICAvKiogQGludGVybmFsICovXG4gIF9uZXh0UmVtb3ZlZDogSXRlcmFibGVDaGFuZ2VSZWNvcmRfPFY+fG51bGwgPSBudWxsO1xuICAvKiogQGludGVybmFsICovXG4gIF9uZXh0QWRkZWQ6IEl0ZXJhYmxlQ2hhbmdlUmVjb3JkXzxWPnxudWxsID0gbnVsbDtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfbmV4dE1vdmVkOiBJdGVyYWJsZUNoYW5nZVJlY29yZF88Vj58bnVsbCA9IG51bGw7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX25leHRJZGVudGl0eUNoYW5nZTogSXRlcmFibGVDaGFuZ2VSZWNvcmRfPFY+fG51bGwgPSBudWxsO1xuXG5cbiAgY29uc3RydWN0b3IocHVibGljIGl0ZW06IFYsIHB1YmxpYyB0cmFja0J5SWQ6IGFueSkge31cbn1cblxuLy8gQSBsaW5rZWQgbGlzdCBvZiBDb2xsZWN0aW9uQ2hhbmdlUmVjb3JkcyB3aXRoIHRoZSBzYW1lIEl0ZXJhYmxlQ2hhbmdlUmVjb3JkXy5pdGVtXG5jbGFzcyBfRHVwbGljYXRlSXRlbVJlY29yZExpc3Q8Vj4ge1xuICAvKiogQGludGVybmFsICovXG4gIF9oZWFkOiBJdGVyYWJsZUNoYW5nZVJlY29yZF88Vj58bnVsbCA9IG51bGw7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3RhaWw6IEl0ZXJhYmxlQ2hhbmdlUmVjb3JkXzxWPnxudWxsID0gbnVsbDtcblxuICAvKipcbiAgICogQXBwZW5kIHRoZSByZWNvcmQgdG8gdGhlIGxpc3Qgb2YgZHVwbGljYXRlcy5cbiAgICpcbiAgICogTm90ZTogYnkgZGVzaWduIGFsbCByZWNvcmRzIGluIHRoZSBsaXN0IG9mIGR1cGxpY2F0ZXMgaG9sZCB0aGUgc2FtZSB2YWx1ZSBpbiByZWNvcmQuaXRlbS5cbiAgICovXG4gIGFkZChyZWNvcmQ6IEl0ZXJhYmxlQ2hhbmdlUmVjb3JkXzxWPik6IHZvaWQge1xuICAgIGlmICh0aGlzLl9oZWFkID09PSBudWxsKSB7XG4gICAgICB0aGlzLl9oZWFkID0gdGhpcy5fdGFpbCA9IHJlY29yZDtcbiAgICAgIHJlY29yZC5fbmV4dER1cCA9IG51bGw7XG4gICAgICByZWNvcmQuX3ByZXZEdXAgPSBudWxsO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBUT0RPKHZpY2IpOlxuICAgICAgLy8gYXNzZXJ0KHJlY29yZC5pdGVtID09ICBfaGVhZC5pdGVtIHx8XG4gICAgICAvLyAgICAgICByZWNvcmQuaXRlbSBpcyBudW0gJiYgcmVjb3JkLml0ZW0uaXNOYU4gJiYgX2hlYWQuaXRlbSBpcyBudW0gJiYgX2hlYWQuaXRlbS5pc05hTik7XG4gICAgICB0aGlzLl90YWlsICEuX25leHREdXAgPSByZWNvcmQ7XG4gICAgICByZWNvcmQuX3ByZXZEdXAgPSB0aGlzLl90YWlsO1xuICAgICAgcmVjb3JkLl9uZXh0RHVwID0gbnVsbDtcbiAgICAgIHRoaXMuX3RhaWwgPSByZWNvcmQ7XG4gICAgfVxuICB9XG5cbiAgLy8gUmV0dXJucyBhIEl0ZXJhYmxlQ2hhbmdlUmVjb3JkXyBoYXZpbmcgSXRlcmFibGVDaGFuZ2VSZWNvcmRfLnRyYWNrQnlJZCA9PSB0cmFja0J5SWQgYW5kXG4gIC8vIEl0ZXJhYmxlQ2hhbmdlUmVjb3JkXy5jdXJyZW50SW5kZXggPj0gYXRPckFmdGVySW5kZXhcbiAgZ2V0KHRyYWNrQnlJZDogYW55LCBhdE9yQWZ0ZXJJbmRleDogbnVtYmVyfG51bGwpOiBJdGVyYWJsZUNoYW5nZVJlY29yZF88Vj58bnVsbCB7XG4gICAgbGV0IHJlY29yZDogSXRlcmFibGVDaGFuZ2VSZWNvcmRfPFY+fG51bGw7XG4gICAgZm9yIChyZWNvcmQgPSB0aGlzLl9oZWFkOyByZWNvcmQgIT09IG51bGw7IHJlY29yZCA9IHJlY29yZC5fbmV4dER1cCkge1xuICAgICAgaWYgKChhdE9yQWZ0ZXJJbmRleCA9PT0gbnVsbCB8fCBhdE9yQWZ0ZXJJbmRleCA8PSByZWNvcmQuY3VycmVudEluZGV4ICEpICYmXG4gICAgICAgICAgbG9vc2VJZGVudGljYWwocmVjb3JkLnRyYWNrQnlJZCwgdHJhY2tCeUlkKSkge1xuICAgICAgICByZXR1cm4gcmVjb3JkO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmUgb25lIHtAbGluayBJdGVyYWJsZUNoYW5nZVJlY29yZF99IGZyb20gdGhlIGxpc3Qgb2YgZHVwbGljYXRlcy5cbiAgICpcbiAgICogUmV0dXJucyB3aGV0aGVyIHRoZSBsaXN0IG9mIGR1cGxpY2F0ZXMgaXMgZW1wdHkuXG4gICAqL1xuICByZW1vdmUocmVjb3JkOiBJdGVyYWJsZUNoYW5nZVJlY29yZF88Vj4pOiBib29sZWFuIHtcbiAgICAvLyBUT0RPKHZpY2IpOlxuICAgIC8vIGFzc2VydCgoKSB7XG4gICAgLy8gIC8vIHZlcmlmeSB0aGF0IHRoZSByZWNvcmQgYmVpbmcgcmVtb3ZlZCBpcyBpbiB0aGUgbGlzdC5cbiAgICAvLyAgZm9yIChJdGVyYWJsZUNoYW5nZVJlY29yZF8gY3Vyc29yID0gX2hlYWQ7IGN1cnNvciAhPSBudWxsOyBjdXJzb3IgPSBjdXJzb3IuX25leHREdXApIHtcbiAgICAvLyAgICBpZiAoaWRlbnRpY2FsKGN1cnNvciwgcmVjb3JkKSkgcmV0dXJuIHRydWU7XG4gICAgLy8gIH1cbiAgICAvLyAgcmV0dXJuIGZhbHNlO1xuICAgIC8vfSk7XG5cbiAgICBjb25zdCBwcmV2OiBJdGVyYWJsZUNoYW5nZVJlY29yZF88Vj58bnVsbCA9IHJlY29yZC5fcHJldkR1cDtcbiAgICBjb25zdCBuZXh0OiBJdGVyYWJsZUNoYW5nZVJlY29yZF88Vj58bnVsbCA9IHJlY29yZC5fbmV4dER1cDtcbiAgICBpZiAocHJldiA9PT0gbnVsbCkge1xuICAgICAgdGhpcy5faGVhZCA9IG5leHQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHByZXYuX25leHREdXAgPSBuZXh0O1xuICAgIH1cbiAgICBpZiAobmV4dCA9PT0gbnVsbCkge1xuICAgICAgdGhpcy5fdGFpbCA9IHByZXY7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5leHQuX3ByZXZEdXAgPSBwcmV2O1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5faGVhZCA9PT0gbnVsbDtcbiAgfVxufVxuXG5jbGFzcyBfRHVwbGljYXRlTWFwPFY+IHtcbiAgbWFwID0gbmV3IE1hcDxhbnksIF9EdXBsaWNhdGVJdGVtUmVjb3JkTGlzdDxWPj4oKTtcblxuICBwdXQocmVjb3JkOiBJdGVyYWJsZUNoYW5nZVJlY29yZF88Vj4pIHtcbiAgICBjb25zdCBrZXkgPSByZWNvcmQudHJhY2tCeUlkO1xuXG4gICAgbGV0IGR1cGxpY2F0ZXMgPSB0aGlzLm1hcC5nZXQoa2V5KTtcbiAgICBpZiAoIWR1cGxpY2F0ZXMpIHtcbiAgICAgIGR1cGxpY2F0ZXMgPSBuZXcgX0R1cGxpY2F0ZUl0ZW1SZWNvcmRMaXN0PFY+KCk7XG4gICAgICB0aGlzLm1hcC5zZXQoa2V5LCBkdXBsaWNhdGVzKTtcbiAgICB9XG4gICAgZHVwbGljYXRlcy5hZGQocmVjb3JkKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXRyaWV2ZSB0aGUgYHZhbHVlYCB1c2luZyBrZXkuIEJlY2F1c2UgdGhlIEl0ZXJhYmxlQ2hhbmdlUmVjb3JkXyB2YWx1ZSBtYXkgYmUgb25lIHdoaWNoIHdlXG4gICAqIGhhdmUgYWxyZWFkeSBpdGVyYXRlZCBvdmVyLCB3ZSB1c2UgdGhlIGBhdE9yQWZ0ZXJJbmRleGAgdG8gcHJldGVuZCBpdCBpcyBub3QgdGhlcmUuXG4gICAqXG4gICAqIFVzZSBjYXNlOiBgW2EsIGIsIGMsIGEsIGFdYCBpZiB3ZSBhcmUgYXQgaW5kZXggYDNgIHdoaWNoIGlzIHRoZSBzZWNvbmQgYGFgIHRoZW4gYXNraW5nIGlmIHdlXG4gICAqIGhhdmUgYW55IG1vcmUgYGFgcyBuZWVkcyB0byByZXR1cm4gdGhlIHNlY29uZCBgYWAuXG4gICAqL1xuICBnZXQodHJhY2tCeUlkOiBhbnksIGF0T3JBZnRlckluZGV4OiBudW1iZXJ8bnVsbCk6IEl0ZXJhYmxlQ2hhbmdlUmVjb3JkXzxWPnxudWxsIHtcbiAgICBjb25zdCBrZXkgPSB0cmFja0J5SWQ7XG4gICAgY29uc3QgcmVjb3JkTGlzdCA9IHRoaXMubWFwLmdldChrZXkpO1xuICAgIHJldHVybiByZWNvcmRMaXN0ID8gcmVjb3JkTGlzdC5nZXQodHJhY2tCeUlkLCBhdE9yQWZ0ZXJJbmRleCkgOiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgYSB7QGxpbmsgSXRlcmFibGVDaGFuZ2VSZWNvcmRffSBmcm9tIHRoZSBsaXN0IG9mIGR1cGxpY2F0ZXMuXG4gICAqXG4gICAqIFRoZSBsaXN0IG9mIGR1cGxpY2F0ZXMgYWxzbyBpcyByZW1vdmVkIGZyb20gdGhlIG1hcCBpZiBpdCBnZXRzIGVtcHR5LlxuICAgKi9cbiAgcmVtb3ZlKHJlY29yZDogSXRlcmFibGVDaGFuZ2VSZWNvcmRfPFY+KTogSXRlcmFibGVDaGFuZ2VSZWNvcmRfPFY+IHtcbiAgICBjb25zdCBrZXkgPSByZWNvcmQudHJhY2tCeUlkO1xuICAgIGNvbnN0IHJlY29yZExpc3Q6IF9EdXBsaWNhdGVJdGVtUmVjb3JkTGlzdDxWPiA9IHRoaXMubWFwLmdldChrZXkpICE7XG4gICAgLy8gUmVtb3ZlIHRoZSBsaXN0IG9mIGR1cGxpY2F0ZXMgd2hlbiBpdCBnZXRzIGVtcHR5XG4gICAgaWYgKHJlY29yZExpc3QucmVtb3ZlKHJlY29yZCkpIHtcbiAgICAgIHRoaXMubWFwLmRlbGV0ZShrZXkpO1xuICAgIH1cbiAgICByZXR1cm4gcmVjb3JkO1xuICB9XG5cbiAgZ2V0IGlzRW1wdHkoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLm1hcC5zaXplID09PSAwOyB9XG5cbiAgY2xlYXIoKSB7IHRoaXMubWFwLmNsZWFyKCk7IH1cbn1cblxuZnVuY3Rpb24gZ2V0UHJldmlvdXNJbmRleChcbiAgICBpdGVtOiBhbnksIGFkZFJlbW92ZU9mZnNldDogbnVtYmVyLCBtb3ZlT2Zmc2V0czogbnVtYmVyW10gfCBudWxsKTogbnVtYmVyIHtcbiAgY29uc3QgcHJldmlvdXNJbmRleCA9IGl0ZW0ucHJldmlvdXNJbmRleDtcbiAgaWYgKHByZXZpb3VzSW5kZXggPT09IG51bGwpIHJldHVybiBwcmV2aW91c0luZGV4O1xuICBsZXQgbW92ZU9mZnNldCA9IDA7XG4gIGlmIChtb3ZlT2Zmc2V0cyAmJiBwcmV2aW91c0luZGV4IDwgbW92ZU9mZnNldHMubGVuZ3RoKSB7XG4gICAgbW92ZU9mZnNldCA9IG1vdmVPZmZzZXRzW3ByZXZpb3VzSW5kZXhdO1xuICB9XG4gIHJldHVybiBwcmV2aW91c0luZGV4ICsgYWRkUmVtb3ZlT2Zmc2V0ICsgbW92ZU9mZnNldDtcbn1cbiJdfQ==