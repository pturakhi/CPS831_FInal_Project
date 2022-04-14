

App = {
    contracts : {},    
    loading: false,

    load: async () => {
    
      await App.loadWeb3();
      await App.loadAccount();
      await App.loadContract();
      await App.render();
      //await App.renderTasks();
    },
    
    loadWeb3: async () => {
      if (typeof web3 !== 'undefined') {
        //App.web3Provider = web3.currentProvider
        //web3 = new Web3(web3.currentProvider)
        App.web3Provider = window.ethereum
        web3 = new Web3(window.ethereum)
        web3.eth.defaultAccount = web3.eth.accounts[0]
      } else {
        window.alert("Please connect to Metamask.")
      }
      // Modern dapp browsers...
      if (window.ethereum) {
        window.web3 = new Web3(ethereum)
        
        try {
          // Request account access if needed
          await ethereum.enable()
          
          // Acccounts now exposed
          
          web3.eth.sendTransaction(/* ... */)
        } catch (error) {
          // User denied account access...
        }
      }
      // Legacy dapp browsers...
      //else if (window.web3) {
      //  App.web3Provider = web3.currentProvider
      //  window.web3 = new Web3(web3.currentProvider)
      //  // Acccounts always exposed
      //  web3.eth.sendTransaction({/* ... */})
      //}
      // Non-dapp browsers...
      else {
        console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
      }
    },
  
    loadAccount: async () => {
      // Set the current blockchain account
     const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
     App.account = web3.eth.accounts[0]
    App.account = accounts[0];
    
     //App.account = web3.eth.accounts[0]
     
    },
    loadContract: async () => {
      const todoList = await $.getJSON("TodoList.json");
      App.contracts.TodoList = TruffleContract(todoList);
      App.contracts.TodoList.setProvider(App.web3Provider);
      App.todoList = await App.contracts.TodoList.deployed();
      
    },
    
    render: async () => {
        // Prevent double render
        if (App.loading) {
          return
        }
    
        // Update app loading state
        App.setLoading(true)
    
        // Render Account
        $('#account').html(App.account)
    
        // Render Tasks
        await App.renderTasks()
    
        // Update loading state
        App.setLoading(false)
      },
    
      renderTasks: async () => {
        // Load the total task count from the blockchain
        const taskCount = await App.todoList.taskCount()
        const $taskTemplate = $('.taskTemplate')
    
        // Render out each task with a new task template
        var completedCount = 0;
        for (var i = 1; i <= taskCount; i++) {
          // Fetch the task data from the blockchain
          const task = await App.todoList.tasks(i)
          const taskId = task[0].toNumber()
          const taskContent = task[1]
          const taskCompleted = task[2]
          if(task[2] == true){ 
            completedCount = completedCount + 1;
          }
    
          // Create the html for the task
          const $newTaskTemplate = $taskTemplate.clone()
          $newTaskTemplate.find('.content').html(taskContent)
          $newTaskTemplate.find('input')
                          .prop('name', taskId)
                          .prop('checked', taskCompleted)
                          .on('click', App.toggleCompleted)
    
          // Put the task in the correct list
          if (taskCompleted) {
            $('#completedTaskList').append($newTaskTemplate)
          } else {
            $('#taskList').append($newTaskTemplate)
          }
          const totalTaskCount = taskCount.c[0];
          console.log("Testing array:", taskCount);
          document.getElementById("tCount").innerHTML = totalTaskCount;
          document.getElementById("compCount").innerHTML = completedCount;
          // Show the task
          $newTaskTemplate.show()
        }
      },

      createTask: async () => {
        App.setLoading(true)
        const content = $('#newTask').val()
        //web3.eth.defaultAccount = web3.eth.accounts[0]
        await App.todoList.createTask(content)
        window.location.reload()
      },
    
      toggleCompleted: async (e) => {
        App.setLoading(true)
        const taskId = e.target.name
        //web3.eth.defaultAccount = web3.eth.accounts[0]
        await App.todoList.toggleCompleted(taskId)
        window.location.reload()
      },

      toggleUndoAll: async () => {
        App.setLoading(true)
        const taskCount = await App.todoList.taskCount()
        for (var i = 1; i <= taskCount; i++) {
          // Fetch the task data from the blockchain
          const task = await App.todoList.tasks(i)
          if(task[2] == true){ 
            const taskId = task[0].toNumber()
            await App.todoList.toggleCompleted(taskId)
            console.log("Task ", taskId, ": ")
          }
        }
        
        // const listOfIds = [];
        // for (var i = 1; i <= taskCount; i++) {
        //   // Fetch the task data from the blockchain
        //   const task = await App.todoList.tasks(i)
        //   if(task[2] == true){ 
        //     const taskId = task[0].toNumber()
        //     listOfIds[i]= taskId;
            
        //     console.log("Task ", taskId, ": ")
        //   }
        // }
        // await App.todoList.toggleUncompleted(listOfIds)
        window.location.reload()
      },

      taskUpdated: async (e) => {
        App.setLoading(true)
        const newContent = "default"
        //web3.eth.defaultAccount = web3.eth.accounts[0]
        await App.todoList.taskUpdated(newContent)
        window.location.reload()
      },


      setLoading: (boolean) => {
        App.loading = boolean
        const loader = $('#loader')
        const content = $('#content')
        if (boolean) {
          loader.show()
          content.hide()
        } else {
          loader.hide()
          content.show()
        }
      }

    };
    $(() => {
      $(window).load(() => {
        App.load();
      });
    });