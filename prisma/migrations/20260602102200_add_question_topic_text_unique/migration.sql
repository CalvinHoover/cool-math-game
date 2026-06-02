-- CreateIndex
CREATE UNIQUE INDEX "Question_topicId_text_key" ON "Question"("topicId", "text");
