def undo(self):
    if not self.network.data.undo_change():
        self.report_error("ERROR :: Can't go further back.")
        return
    
    self.connection.send("OK")
    print("Last change was undone.")

def redo(self):
    if not self.network.data.redo_change():
        self.report_error("ERROR :: Can't go further forward.")
        return
    
    self.connection.send("OK")
    print("Last change was redone.")