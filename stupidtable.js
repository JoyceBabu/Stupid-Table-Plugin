// Stupid jQuery table plugin.

// Call on a table
// sortFns: Sort functions for your datatypes.
(function($){
  $.fn.stupidtable = function(sortFns){
    return this.each(function () {
      var table = $(this);
      sortFns = sortFns || {};

      // ==================================================== //
      //                  Utility functions                   //
      // ==================================================== //

      // Merge sort functions with some default sort functions.
      sortFns = $.extend({}, {
        "int":function(a,b){ return parseInt(a, 10) - parseInt(b,10); },
        "float":function(a,b){ return parseFloat(a) - parseFloat(b); },
        "string":function(a,b){ if (a<b) return -1; if (a>b) return +1; return 0;}
      }, sortFns);

      // Array comparison. See http://stackoverflow.com/a/8618383
      var arrays_equal = function(a,b) { return !!a && !!b && !(a<b || b<a);}

      // Return the resulting indexes of a sort so we can apply
      // this result elsewhere. This returns an array of index numbers.
      // return[0] = x means "arr's 0th element is now at x"
      var sort_map =  function(arr, sort_function){
        var sorted = arr.slice(0).sort(sort_function);
        var map = [];
        var index = 0;
        for(var i=0; i<arr.length; i++){
          index = $.inArray(arr[i], sorted);

          // If this index is already in the map, look for the next index.
          // This handles the case of duplicate entries.
          while($.inArray(index, map) != -1){
            index++;
          }
          map.push(index);
        }
        return map;
      }

      // Apply a sort map to the array.
      var apply_sort_map = function(arr, map){
        var clone = arr.slice(0);
        for(var i=0; i<map.length; i++){
          newIndex = map[i];
          clone[newIndex] = arr[i];
        }
        return clone;
      }

      // Returns true if array is sorted, false otherwise.
      // Checks for both ascending and descending
      var is_sorted_array = function(arr, sort_function){
        var clone = arr.slice(0);
        var reversed = arr.slice(0).reverse();
        var sorted = arr.slice(0).sort(sort_function);

        // Check if the array is sorted in either direction.
        return arrays_equal(clone, sorted) || arrays_equal(reversed, sorted);
      }

      // ==================================================== //
      //                  Begin execution!                    //
      // ==================================================== //
      // Do sorting when THs are clicked
      table.on("click", "th", function(){
        var trs = table.children("tbody").children("tr");
        var $this = $(this);
        var th_index = $this.index();
        // Prevent sorting if no type defined
        var type = $this.data('sort') || null;

        if(type){
          var sortMethod = sortFns[type];

          // Gather the elements for this column
          column = [];

          // Push either the value of the 'data-order-by' attribute if specified
          // or just the text() value in this column to column[] for comparison.
          trs.each(function(index,tr){
            var e = $(tr).children().eq(th_index);
            var order_by = e.data('sort-value') || e.text();
            column.push(order_by);
          });

          // If the column is already sorted, just reverse the order. The sort
          // map is just reversing the indexes.
          var sorted = is_sorted_array(column, sortMethod);
          if(sorted){
            column.reverse();
            var theMap = [];
            for(var i=column.length-1; i>=0; i--){
              theMap.push(i);
            }
          }
          else{
            // Get a sort map and apply to all rows
            theMap = sort_map(column, sortMethod);
          }

          var sortedTRs = $(apply_sort_map(trs, theMap));

          // Replace the content of tbody with the sortedTRs. Strangely (and
          // conveniently!) enough, .append accomplishes this for us.
          table.children("tbody").append(sortedTRs);

          // Trigger `aftertablesort` event that calling scripts can hook into;
          // pass parameters for column sorted and sorting direction
          // TODO: remove `data-sort-dir` when sorting different column
          var sort_dir = $this.data('sort-dir') === 'asc' ? 'desc' : 'asc';
          $this.data('sort-dir', sort_dir);
          table.trigger("aftertablesort", {column: th_index, direction: sort_dir})
        }
      });
    });
  }
 })(jQuery);
