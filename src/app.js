

App = {
    contracts : {},    
    loading: false,

    load: async () => {
    
      await App.loadWeb3();
      await App.loadAccount();
      await App.loadContract();
      await App.render();
      await App.renderTasks();
    },
    
    loadWeb3: async () => {
        
        const provider = await detectEthereumProvider()

        if (provider) {
          console.log('Ethereum successfully detected!')
          // From now on, this should always be true:
          // provider === window.ethereum
        
          // Access the decentralized web!
        
          // Legacy providers may only have ethereum.sendAsync
          App.web3Provider = web3.currentProvider
          //App.web3Provider = new Web3(ethereum)
          const chainId = await provider.request({
            method: 'eth_chainId'
          })
        } else {
          // if the provider is not detected, detectEthereumProvider resolves to null
          console.error('Please install MetaMask!' )
        }
    },
    loadAccount: async () => {
      // Set the current blockchain account
     const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
     //App.account = web3.eth.accounts[0]
    App.account = accounts[0];
     //App.account = web3.eth.accounts[0]
     console.log(accounts[0]);
    },
    loadContract: async () => {
      const todoList = await $.getJSON("TodoList.json");
      App.contracts.TodoList = TruffleContract(todoList);
      App.contracts.TodoList.setProvider(App.web3Provider);
      App.todoList = await App.contracts.TodoList.deployed();
      
    },
    render: async () => {
      
       
        
      $("#account").html(App.account)

      
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
        for (var i = 1; i <= taskCount; i++) {
          // Fetch the task data from the blockchain
          const task = await App.todoList.tasks(i)
          const taskId = task[0].toNumber()
          const taskContent = task[1]
          const taskCompleted = task[2]
    
          // Create the html for the task
          const $newTaskTemplate = $taskTemplate.clone()
          $newTaskTemplate.find('.content').html(taskContent)
          $newTaskTemplate.find('input')
                          .prop('name', taskId)
                          .prop('checked', taskCompleted)
                          //.on('click', App.toggleCompleted)
    
          // Put the task in the correct list
          if (taskCompleted) {
            $('#completedTaskList').append($newTaskTemplate)
          } else {
            $('#taskList').append($newTaskTemplate)
          }
    
          // Show the task
          $newTaskTemplate.show()
        }
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